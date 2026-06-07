import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  private var captureShieldView: UIView?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Nursetra",
      in: window,
      launchOptions: launchOptions
    )

    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleScreenCaptureStateChange),
      name: UIScreen.capturedDidChangeNotification,
      object: nil
    )
    NotificationCenter.default.addObserver(
      self,
      selector: #selector(handleScreenshotTaken),
      name: UIApplication.userDidTakeScreenshotNotification,
      object: nil
    )

    return true
  }

  @objc private func handleScreenCaptureStateChange() {
    if UIScreen.main.isCaptured {
      showCaptureShield(message: "Screen recording is blocked in this app.")
    } else {
      hideCaptureShield()
    }
  }

  @objc private func handleScreenshotTaken() {
    showCaptureShield(message: "Screenshots are not allowed in this app.")

    DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { [weak self] in
      guard UIScreen.main.isCaptured == false else { return }
      self?.hideCaptureShield()
    }
  }

  private func showCaptureShield(message: String) {
    guard let window = window else { return }

    if captureShieldView == nil {
      let shieldView = UIView(frame: window.bounds)
      shieldView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
      shieldView.backgroundColor = UIColor(red: 0.05, green: 0.10, blue: 0.21, alpha: 0.96)

      let stackView = UIStackView()
      stackView.axis = .vertical
      stackView.alignment = .center
      stackView.spacing = 14
      stackView.translatesAutoresizingMaskIntoConstraints = false

      let iconView = UIImageView(image: UIImage(systemName: "eye.slash.fill"))
      iconView.tintColor = .white
      iconView.contentMode = .scaleAspectFit
      iconView.translatesAutoresizingMaskIntoConstraints = false
      NSLayoutConstraint.activate([
        iconView.widthAnchor.constraint(equalToConstant: 34),
        iconView.heightAnchor.constraint(equalToConstant: 34),
      ])

      let titleLabel = UILabel()
      titleLabel.text = "Security Protected"
      titleLabel.textColor = .white
      titleLabel.font = UIFont.systemFont(ofSize: 20, weight: .bold)

      let messageLabel = UILabel()
      messageLabel.tag = 1001
      messageLabel.textColor = UIColor.white.withAlphaComponent(0.9)
      messageLabel.font = UIFont.systemFont(ofSize: 15, weight: .medium)
      messageLabel.numberOfLines = 0
      messageLabel.textAlignment = .center
      messageLabel.text = message

      stackView.addArrangedSubview(iconView)
      stackView.addArrangedSubview(titleLabel)
      stackView.addArrangedSubview(messageLabel)
      shieldView.addSubview(stackView)

      NSLayoutConstraint.activate([
        stackView.centerXAnchor.constraint(equalTo: shieldView.centerXAnchor),
        stackView.centerYAnchor.constraint(equalTo: shieldView.centerYAnchor),
        stackView.leadingAnchor.constraint(greaterThanOrEqualTo: shieldView.leadingAnchor, constant: 24),
        stackView.trailingAnchor.constraint(lessThanOrEqualTo: shieldView.trailingAnchor, constant: -24),
      ])

      captureShieldView = shieldView
    }

    if let messageLabel = captureShieldView?.viewWithTag(1001) as? UILabel {
      messageLabel.text = message
    }

    if let shieldView = captureShieldView, shieldView.superview == nil {
      window.addSubview(shieldView)
    }

    if let shieldView = captureShieldView {
      window.bringSubviewToFront(shieldView)
    }
  }

  private func hideCaptureShield() {
    captureShieldView?.removeFromSuperview()
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
