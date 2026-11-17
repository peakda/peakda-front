import Foundation
import Capacitor
import CoreLocation
import WebKit

// WKWebView 의 navigator.geolocation 은 앱 위치 권한과 별도로 사이트 권한 창
// ("'www.peakda.com'이(가) 사용자의 현재 위치를 사용하려고 합니다")을 띄우고, 이 결정은 일정 기간만 기억된다.
// 이 창을 끌 공개 API 가 없으므로, 웹이 쓰는 getCurrentPosition·permissions.query('geolocation') 만
// CoreLocation 으로 대신 처리해 iOS 앱 권한 창 하나만 뜨게 한다. 웹 코드(src/lib/kakao/mapViewport.ts)는 그대로다.
// watchPosition 은 웹에서 쓰지 않아 WebKit 기본 동작으로 둔다. Android 는 해당 없음.
@objc(NativeGeolocationPlugin)
public class NativeGeolocationPlugin: CAPPlugin, CAPBridgedPlugin, CLLocationManagerDelegate {
    public let identifier = "NativeGeolocationPlugin"
    public let jsName = "NativeGeolocation"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "checkPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "requestPermission", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "getCurrentPosition", returnType: CAPPluginReturnPromise)
    ]

    private static let shim = """
    (function () {
      if (!navigator.geolocation || !window.Capacitor) return;
      var native = function (method, options) {
        return window.Capacitor.nativePromise('NativeGeolocation', method, options || {});
      };
      var ERROR_CODES = { PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
      var positionError = function (code, message) {
        return { code: code, message: message, PERMISSION_DENIED: 1, POSITION_UNAVAILABLE: 2, TIMEOUT: 3 };
      };
      navigator.geolocation.getCurrentPosition = function (success, failure, options) {
        options = options || {};
        var done = false;
        var timer = null;
        var fail = function (code, message) {
          if (done) return;
          done = true;
          if (timer) clearTimeout(timer);
          if (failure) failure(positionError(code, message));
        };
        var reject = function (error) {
          fail(ERROR_CODES[error && error.code] || 2, (error && error.message) || 'Position unavailable');
        };
        // Web API 처럼 timeout 은 권한을 받은 뒤부터 센다. 권한 창이 떠 있는 동안 흐르면 시간 초과가 된다.
        native('requestPermission').then(function (result) {
          if (result.state !== 'granted') return fail(1, 'User denied Geolocation');
          if (typeof options.timeout === 'number' && isFinite(options.timeout)) {
            timer = setTimeout(function () { fail(3, 'Timeout expired'); }, Math.max(0, options.timeout));
          }
          return native('getCurrentPosition', {
            enableHighAccuracy: !!options.enableHighAccuracy,
            maximumAge: typeof options.maximumAge === 'number' ? options.maximumAge : 0
          }).then(function (position) {
            if (done) return;
            done = true;
            if (timer) clearTimeout(timer);
            success(position);
          }, reject);
        }, reject);
      };
      if (navigator.permissions && navigator.permissions.query) {
        var query = navigator.permissions.query.bind(navigator.permissions);
        navigator.permissions.query = function (descriptor) {
          if (!descriptor || descriptor.name !== 'geolocation') return query(descriptor);
          return native('checkPermission').then(function (result) {
            return {
              name: 'geolocation',
              state: result.state,
              onchange: null,
              addEventListener: function () {},
              removeEventListener: function () {},
              dispatchEvent: function () { return false; }
            };
          });
        };
      }
    })();
    """

    private let locationManager = CLLocationManager()
    // 권한 창 응답을 기다리는 요청
    private var permissionCalls: [CAPPluginCall] = []
    // 위치 응답을 기다리는 요청. 모두 같은 위치로 한 번에 응답한다.
    private var locationCalls: [CAPPluginCall] = []

    override public func load() {
        locationManager.delegate = self
        // Capacitor 브리지 스크립트 뒤에 실행되도록, 브리지가 만든 WebView 설정에 덧붙인다.
        let script = WKUserScript(source: Self.shim, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        bridge?.webView?.configuration.userContentController.addUserScript(script)
    }

    @objc func checkPermission(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            call.resolve(["state": self.permissionState()])
        }
    }

    /// 아직 묻지 않았으면 iOS 권한 창을 띄우고, 사용자가 고른 뒤의 상태를 돌려준다.
    @objc func requestPermission(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            guard self.permissionState() == "prompt" else {
                call.resolve(["state": self.permissionState()])
                return
            }
            self.permissionCalls.append(call)
            self.locationManager.requestWhenInUseAuthorization()
        }
    }

    /// 권한을 받은 뒤에 부른다. options.enableHighAccuracy, options.maximumAge(ms) 는 Web API 와 같은 뜻이다.
    @objc func getCurrentPosition(_ call: CAPPluginCall) {
        let highAccuracy = call.getBool("enableHighAccuracy") ?? false
        let maximumAge = call.getDouble("maximumAge") ?? 0

        DispatchQueue.main.async {
            guard self.permissionState() == "granted" else {
                call.reject("User denied Geolocation", "PERMISSION_DENIED")
                return
            }
            if let cached = self.locationManager.location, Date().timeIntervalSince(cached.timestamp) * 1000 <= maximumAge {
                call.resolve(Self.position(cached))
                return
            }
            self.locationCalls.append(call)
            self.locationManager.desiredAccuracy = highAccuracy ? kCLLocationAccuracyBest : kCLLocationAccuracyHundredMeters
            self.locationManager.requestLocation()
        }
    }

    public func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
        let state = permissionState()
        guard state != "prompt" else { return }
        let calls = permissionCalls
        permissionCalls.removeAll()
        calls.forEach { $0.resolve(["state": state]) }
    }

    public func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        guard let location = locations.last else { return }
        let calls = locationCalls
        locationCalls.removeAll()
        calls.forEach { $0.resolve(Self.position(location)) }
    }

    public func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        let denied = (error as? CLError)?.code == .denied
        let calls = locationCalls
        locationCalls.removeAll()
        calls.forEach {
            $0.reject(denied ? "User denied Geolocation" : error.localizedDescription, denied ? "PERMISSION_DENIED" : "POSITION_UNAVAILABLE")
        }
    }

    // Permissions API 의 PermissionState 와 같은 값.
    private func permissionState() -> String {
        switch locationManager.authorizationStatus {
        case .notDetermined:
            return "prompt"
        case .authorizedWhenInUse, .authorizedAlways:
            return "granted"
        default:
            return "denied"
        }
    }

    // Web API 의 GeolocationPosition 과 같은 모양.
    private static func position(_ location: CLLocation) -> [String: Any] {
        // 값이 없으면(음수) Web API 처럼 null 로 보낸다.
        let valueOrNull = { (value: Double, valid: Bool) -> Any in valid ? value : NSNull() }
        return [
            "coords": [
                "latitude": location.coordinate.latitude,
                "longitude": location.coordinate.longitude,
                "accuracy": location.horizontalAccuracy,
                "altitude": valueOrNull(location.altitude, location.verticalAccuracy >= 0),
                "altitudeAccuracy": valueOrNull(location.verticalAccuracy, location.verticalAccuracy >= 0),
                "heading": valueOrNull(location.course, location.course >= 0),
                "speed": valueOrNull(location.speed, location.speed >= 0)
            ],
            "timestamp": location.timestamp.timeIntervalSince1970 * 1000
        ]
    }
}
