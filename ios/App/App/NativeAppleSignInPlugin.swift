import Foundation
import Capacitor
import AuthenticationServices
import CryptoKit

// iOS 기본 "Apple로 계속하기" 창을 띄우고 identity token·authorization code 를 JS 로 돌려준다.
// 토큰 검증과 회원 처리는 서버(POST /api/auth/app/apple)가 한다 — src/lib/auth/appleLogin.ts 참고.
@objc(NativeAppleSignInPlugin)
public class NativeAppleSignInPlugin: CAPPlugin, CAPBridgedPlugin, ASAuthorizationControllerDelegate,
    ASAuthorizationControllerPresentationContextProviding {
    public let identifier = "NativeAppleSignInPlugin"
    public let jsName = "NativeAppleSignIn"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise)
    ]

    private var pendingCall: CAPPluginCall?
    // 요청이 끝날 때까지 컨트롤러를 붙잡아 둔다. 놓치면 결과 콜백이 오지 않을 수 있다.
    private var authorizationController: ASAuthorizationController?

    /// options.nonce: JS 가 만든 원문. 애플에는 SHA-256(hex)을 넣고, 서버에는 원문을 보내 같은 해시인지 확인한다.
    @objc func signIn(_ call: CAPPluginCall) {
        guard let nonce = call.getString("nonce"), !nonce.isEmpty else {
            call.reject("nonce is required")
            return
        }
        guard pendingCall == nil else {
            call.reject("Sign in with Apple is already in progress", "IN_PROGRESS")
            return
        }
        pendingCall = call

        let request = ASAuthorizationAppleIDProvider().createRequest()
        // 닉네임은 가입 단계에서 따로 받으므로 이름은 요청하지 않는다.
        request.requestedScopes = [.email]
        request.nonce = Self.sha256Hex(nonce)

        DispatchQueue.main.async {
            let controller = ASAuthorizationController(authorizationRequests: [request])
            controller.delegate = self
            controller.presentationContextProvider = self
            self.authorizationController = controller
            controller.performRequests()
        }
    }

    public func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        bridge?.webView?.window ?? ASPresentationAnchor()
    }

    public func authorizationController(
        controller: ASAuthorizationController,
        didCompleteWithAuthorization authorization: ASAuthorization
    ) {
        guard
            let credential = authorization.credential as? ASAuthorizationAppleIDCredential,
            let tokenData = credential.identityToken,
            let identityToken = String(data: tokenData, encoding: .utf8),
            let codeData = credential.authorizationCode,
            let authorizationCode = String(data: codeData, encoding: .utf8)
        else {
            finish { $0.reject("Apple did not return an identity token", "NO_TOKEN") }
            return
        }
        finish { $0.resolve(["identityToken": identityToken, "authorizationCode": authorizationCode]) }
    }

    public func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        // 사용자가 창을 닫은 것은 오류로 알리지 않도록 코드로 구분한다.
        let code = (error as? ASAuthorizationError)?.code == .canceled ? "CANCELED" : "FAILED"
        finish { $0.reject(error.localizedDescription, code, error) }
    }

    private func finish(_ respond: (CAPPluginCall) -> Void) {
        guard let call = pendingCall else { return }
        pendingCall = nil
        authorizationController = nil
        respond(call)
    }

    private static func sha256Hex(_ value: String) -> String {
        SHA256.hash(data: Data(value.utf8)).map { String(format: "%02x", $0) }.joined()
    }
}
