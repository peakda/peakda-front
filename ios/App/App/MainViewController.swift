import UIKit
import Capacitor

// 앱 타깃 안의 로컬 플러그인은 자동으로 발견되지 않아 여기서 직접 등록한다.
// Android 의 MainActivity.registerPlugin(NativeSecureStorePlugin.class) 과 같은 역할이다.
class MainViewController: CAPBridgeViewController {
    // WKWebView.navigationDelegate 는 약한 참조라 필터를 여기서 붙잡아 둔다.
    private var navigationErrorFilter: NavigationErrorFilter?

    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeSecureStorePlugin())
        bridge?.registerPluginInstance(NativeAppleSignInPlugin())
        installNavigationErrorFilter()
    }

    // 첫 페이지를 불러오기 전(viewDidLoad 의 loadWebView 이전)에 Capacitor 의 이동 처리기를 감싼다.
    // 이동 취소를 오류 화면으로 바꾸지 않고, 오류 화면의 "다시 시도"가 앱으로 돌아가게 한다 (NavigationErrorFilter 참고).
    private func installNavigationErrorFilter() {
        guard let webView, let capacitorDelegate = webView.navigationDelegate, let config = bridge?.config else { return }
        let filter = NavigationErrorFilter(
            wrapping: capacitorDelegate,
            errorURL: config.errorPathURL,
            startURL: config.appStartServerURL
        )
        navigationErrorFilter = filter
        webView.navigationDelegate = filter
    }

    // capacitor.config 의 StatusBar.style 'DARK'(어두운 배경용 밝은 글씨)는 Android 와 함께 쓰는 값이다.
    // iOS 에 그대로 적용되면 흰 상태바 배경 위에 흰 시계·배터리가 그려져 보이지 않으므로
    // 공통 설정은 두고 iOS 에서만 어두운 글씨로 고정한다. 웹 코드는 상태바 스타일을 바꾸지 않는다.
    override open var preferredStatusBarStyle: UIStatusBarStyle {
        .darkContent
    }
}
