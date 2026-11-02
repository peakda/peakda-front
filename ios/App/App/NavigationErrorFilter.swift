import Foundation
import WebKit

// Capacitor iOS 의 WebView 이동 처리기(WebViewDelegationHandler)를 감싸 두 가지만 바꾼다.
// 나머지 이동 이벤트는 그대로 Capacitor 에 넘긴다. Android 는 해당 없음.
//
// 1. 이동 취소(NSURLErrorCancelled, -999)는 오류 화면으로 바꾸지 않는다.
//    Capacitor 는 provisional navigation 실패를 오류 종류와 관계없이 error.html 로 바꾼다
//    (WebViewDelegationHandler.webView(_:didFailProvisionalNavigation:withError:)).
//    -999 는 앞선 이동이 다음 이동에 밀려 취소됐다는 뜻이라 실패가 아니다. 다음 이동이 화면을 그린다.
//    가입 직후 location.replace('/map') 와 LoginGuard 의 router.refresh() 가 겹칠 때 생긴다.
//    Android Capacitor 는 이동 취소를 오류로 보고하지 않아 같은 흐름에서 문제가 없다.
// 2. 오류 화면의 "다시 시도"(location.reload)는 앱 시작 주소를 다시 불러온다.
//    iOS 의 오류 화면은 앱 안의 로컬 파일이라, 새로고침하면 오류 화면 자신을 다시 불러와 빠져나올 수 없다.
final class NavigationErrorFilter: NSObject, WKNavigationDelegate {
    private let wrapped: WKNavigationDelegate
    private let errorURL: URL?
    private let startURL: URL

    init(wrapping wrapped: WKNavigationDelegate, errorURL: URL?, startURL: URL) {
        self.wrapped = wrapped
        self.errorURL = errorURL
        self.startURL = startURL
    }

    @objc(webView:didFailProvisionalNavigation:withError:)
    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        let nsError = error as NSError
        if nsError.domain == NSURLErrorDomain && nsError.code == NSURLErrorCancelled {
            return
        }
        wrapped.webView?(webView, didFailProvisionalNavigation: navigation, withError: error)
    }

    @objc(webView:decidePolicyForNavigationAction:decisionHandler:)
    func webView(
        _ webView: WKWebView,
        decidePolicyFor navigationAction: WKNavigationAction,
        decisionHandler: @escaping (WKNavigationActionPolicy) -> Void
    ) {
        if navigationAction.navigationType == .reload, isErrorPage(navigationAction.request.url) {
            decisionHandler(.cancel)
            webView.load(URLRequest(url: startURL))
            return
        }
        // Capacitor 가 구현하지 않았다면 직접 허용한다. decisionHandler 를 부르지 않으면 WebKit 이 멈춘다.
        if wrapped.webView?(webView, decidePolicyFor: navigationAction, decisionHandler: decisionHandler) == nil {
            decisionHandler(.allow)
        }
    }

    private func isErrorPage(_ url: URL?) -> Bool {
        guard let url, let errorURL else { return false }
        return url.scheme == errorURL.scheme && url.host == errorURL.host && url.path == errorURL.path
    }

    // 위 두 메서드 말고는 Capacitor 처리기가 그대로 받는다.
    override func responds(to aSelector: Selector!) -> Bool {
        super.responds(to: aSelector) || wrapped.responds(to: aSelector)
    }

    override func forwardingTarget(for aSelector: Selector!) -> Any? {
        wrapped.responds(to: aSelector) ? wrapped : super.forwardingTarget(for: aSelector)
    }
}
