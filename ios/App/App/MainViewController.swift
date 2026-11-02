import UIKit
import Capacitor

// 앱 타깃 안의 로컬 플러그인은 자동으로 발견되지 않아 여기서 직접 등록한다.
// Android 의 MainActivity.registerPlugin(NativeSecureStorePlugin.class) 과 같은 역할이다.
class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(NativeSecureStorePlugin())
        bridge?.registerPluginInstance(NativeAppleSignInPlugin())
    }

    // capacitor.config 의 StatusBar.style 'DARK'(어두운 배경용 밝은 글씨)는 Android 와 함께 쓰는 값이다.
    // iOS 에 그대로 적용되면 흰 상태바 배경 위에 흰 시계·배터리가 그려져 보이지 않으므로
    // 공통 설정은 두고 iOS 에서만 어두운 글씨로 고정한다. 웹 코드는 상태바 스타일을 바꾸지 않는다.
    override open var preferredStatusBarStyle: UIStatusBarStyle {
        .darkContent
    }
}
