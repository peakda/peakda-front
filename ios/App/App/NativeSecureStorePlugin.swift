import Foundation
import Capacitor
import Security

// Android NativeSecureStorePlugin(Android Keystore + AES-GCM)의 iOS 대응.
// 키체인이 암호화와 보관을 함께 맡으므로 값을 따로 암호화하지 않는다.
// JS 인터페이스(get/set/remove, 에러 메시지)는 Android 와 같다 — src/lib/auth/nativeAuth.ts 참고.
@objc(NativeSecureStorePlugin)
public class NativeSecureStorePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "NativeSecureStorePlugin"
    public let jsName = "NativeSecureStore"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "get", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "set", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "remove", returnType: CAPPluginReturnPromise)
    ]

    private static let service = "com.peakda.app.secure-store"
    private static let installedKey = "peakda.secure-store.installed"

    override public func load() {
        // 키체인 항목은 앱을 지워도 남지만 Android(SharedPreferences)는 삭제와 함께 사라진다.
        // UserDefaults 는 삭제 시 지워지므로, 표식이 없는 첫 실행에 남은 토큰을 지워
        // "다시 설치하면 로그아웃" 동작을 Android 와 맞춘다.
        let defaults = UserDefaults.standard
        if !defaults.bool(forKey: Self.installedKey) {
            SecItemDelete([kSecClass: kSecClassGenericPassword, kSecAttrService: Self.service] as CFDictionary)
            defaults.set(true, forKey: Self.installedKey)
        }
    }

    @objc func get(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("key is required")
            return
        }

        var query = baseQuery(key)
        query[kSecReturnData] = true
        query[kSecMatchLimit] = kSecMatchLimitOne

        var item: CFTypeRef?
        let status = SecItemCopyMatching(query as CFDictionary, &item)
        switch status {
        case errSecSuccess:
            guard let data = item as? Data, let value = String(data: data, encoding: .utf8) else {
                // Android 가 복호화 실패 시 값을 지우는 것과 같이, 읽을 수 없는 값은 지운다.
                SecItemDelete(baseQuery(key) as CFDictionary)
                call.reject("Unable to read secure value")
                return
            }
            call.resolve(["value": value])
        case errSecItemNotFound:
            // 빈 객체로 돌려준다. 인자 없는 resolve() 는 JS 에 undefined 로 가서,
            // `const { value } = await NativeSecureStore.get(...)` 구조분해가 TypeError 로 터진다(Android 는 {}).
            call.resolve([:])
        default:
            // 잠금 해제 전 접근(errSecInteractionNotAllowed) 같은 일시 오류는 값을 지우지 않는다.
            // 지우면 멀쩡한 로그인이 풀린다.
            call.reject("Unable to read secure value", String(status))
        }
    }

    @objc func set(_ call: CAPPluginCall) {
        guard let key = call.getString("key"), let value = call.getString("value") else {
            call.reject("key and value are required")
            return
        }

        let data = Data(value.utf8)
        let query = baseQuery(key)
        var status = SecItemUpdate(query as CFDictionary, [kSecValueData: data] as CFDictionary)
        if status == errSecItemNotFound {
            var attributes = query
            attributes[kSecValueData] = data
            // 이 기기에만 두고(iCloud 키체인 동기화 제외) 첫 잠금 해제 뒤에는 백그라운드에서도 읽을 수 있게 한다.
            attributes[kSecAttrAccessible] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            status = SecItemAdd(attributes as CFDictionary, nil)
        }

        if status == errSecSuccess {
            call.resolve()
        } else {
            call.reject("Unable to store secure value", String(status))
        }
    }

    @objc func remove(_ call: CAPPluginCall) {
        guard let key = call.getString("key") else {
            call.reject("key is required")
            return
        }
        // Android 와 같이 삭제는 결과와 관계없이 성공으로 돌려준다. 로그아웃·세션 만료 처리 중에
        // 여기서 실패를 던지면 로그인 시트를 여는 후속 처리가 끊긴다(src/api/mutator/index.ts).
        SecItemDelete(baseQuery(key) as CFDictionary)
        call.resolve()
    }

    private func baseQuery(_ key: String) -> [CFString: Any] {
        [kSecClass: kSecClassGenericPassword, kSecAttrService: Self.service, kSecAttrAccount: key]
    }
}
