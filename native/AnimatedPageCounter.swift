import SwiftUI
import UIKit

// Each mark represents one page. Extra pages are labeled, never rescaled.
private struct CounterPageMarks: View {
    let amount: Int
    var markCount: Int = 20
    var height: CGFloat = 48
    var spacing: CGFloat = 5
    var cornerRadius: CGFloat = 3.5
    var duration: Double = 0.18

    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private var capacity: Int { max(1, markCount) }
    private var shownAmount: Double { Double(min(max(amount, 0), capacity)) }

    var body: some View {
        VStack(spacing: 8) {
            ZStack {
                CounterPageMarksShape(
                    fillLevel: Double(capacity), count: capacity,
                    spacing: spacing, cornerRadius: cornerRadius
                )
                .fill(Color(red: 0.12, green: 0.11, blue: 0.14))

                CounterPageMarksShape(
                    fillLevel: shownAmount, count: capacity,
                    spacing: spacing, cornerRadius: cornerRadius
                )
                .fill(Color(red: 0.74, green: 0.68, blue: 0.85))
                .animation(
                    reduceMotion ? nil : .timingCurve(0.2, 0.8, 0.2, 1, duration: duration),
                    value: shownAmount
                )
            }
            .frame(height: height)

            if amount > capacity {
                Text("\(capacity) shown · \(amount - capacity) more pages")
                    .font(.custom("TestTheFuture-Regular", size: 12))
                    .foregroundStyle(Color(red: 0.73, green: 0.73, blue: 0.77))
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel("Page marks")
        .accessibilityValue("\(max(amount, 0)) pages. Each mark is one page.")
        .accessibilityIdentifier("page-marks")
    }
}

/// A single continuous fill value gives natural forward/reverse sequencing.
/// Rapid changes retarget the current animation; there are no delayed tasks
/// that can refill an old mark after the person has already pressed minus.
private struct CounterPageMarksShape: Shape {
    var fillLevel: Double
    let count: Int
    let spacing: CGFloat
    let cornerRadius: CGFloat

    var animatableData: Double {
        get { fillLevel }
        set { fillLevel = newValue }
    }

    func path(in rect: CGRect) -> Path {
        var path = Path()
        guard count > 0, rect.width > 0, rect.height > 0 else { return path }

        let gap = max(0, min(spacing, rect.width / CGFloat(count * 2)))
        let width = max(0, (rect.width - CGFloat(count - 1) * gap) / CGFloat(count))

        for index in 0..<count {
            let progress = min(max(fillLevel - Double(index), 0), 1)
            guard progress > 0 else { continue }

            let filledHeight = rect.height * CGFloat(progress)
            let mark = CGRect(
                x: rect.minX + CGFloat(index) * (width + gap),
                y: rect.maxY - filledHeight,
                width: width,
                height: filledHeight
            )
            let radius = max(0, min(cornerRadius, width / 2, filledHeight / 2))
            path.addRoundedRect(in: mark, cornerSize: CGSize(width: radius, height: radius))
        }
        return path
    }
}

/// Animated page counter with tap and hold-to-repeat controls. iOS 17+.
///
/// Usage:
///     @State private var pages = 10
///     AnimatedPageCounter(amount: $pages)
///
/// Tap changes the count by one. Hold starts after 280 ms and repeats every 75 ms.
/// The view has a transparent background; place it on your screen's dark background.
/// Uses TestTheFuture fonts when registered, otherwise system fonts.
@available(iOS 17.0, *)
struct AnimatedPageCounter: View {
    @Binding private var amount: Int
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    private let maximum: Int
    private let markCount: Int

    /// Keep the bound amount between zero and maximum.
    /// markCount is the visible capacity; one mark always means one page.
    init(amount: Binding<Int>, maximum: Int = 20, markCount: Int = 20) {
        self._amount = amount
        self.maximum = max(0, maximum)
        self.markCount = max(1, markCount)
    }

    var body: some View {
        VStack(spacing: 0) {
            HStack(spacing: 0) {
                StandalonePageCounterHoldButton(
                    symbol: "−", label: "Decrease pages", enabled: amount > 0,
                    reduceMotion: reduceMotion
                ) {
                    amount = max(0, min(maximum, amount) - 1)
                    return amount > 0
                }
                .frame(width: 48, height: 48)

                Spacer(minLength: 0)
                // Extra vertical room contains both the glyphs and their 10 pt travel.
                // Two independent digit layers avoid the numericText transition's
                // tight rolling mask and retarget cleanly during a held press.
                StandalonePageCounterRollingDigits(amount: amount, reduceMotion: reduceMotion)
                    .frame(width: 156, height: 148)
                Spacer(minLength: 0)

                StandalonePageCounterHoldButton(
                    symbol: "+", label: "Increase pages", enabled: amount < maximum,
                    reduceMotion: reduceMotion
                ) {
                    amount = amount >= maximum ? maximum : max(0, amount) + 1
                    return amount < maximum
                }
                .frame(width: 48, height: 48)
            }

            Text("pages")
                .font(.custom("TestTheFuture-Regular", size: 16))
                .foregroundStyle(.white)
                .padding(.top, 2)

            CounterPageMarks(amount: amount, markCount: markCount)
                .padding(.horizontal, 12)
                .padding(.top, 20)

            Text("Each mark is one page.")
                .font(.custom("TestTheFuture-Regular", size: 12))
                .foregroundStyle(Color(red: 0.73, green: 0.73, blue: 0.77))
                .padding(.top, 16)
        }
        .padding(.horizontal, 24)
        .frame(maxWidth: 440)
    }
}

// Tap = one step on release. Hold = first step at 280 ms, then every 75 ms.
private struct StandalonePageCounterHoldButton: UIViewRepresentable {
    let symbol: String
    let label: String
    let enabled: Bool
    let reduceMotion: Bool
    let step: () -> Bool

    func makeUIView(context: Context) -> StandalonePageCounterHoldControl { StandalonePageCounterHoldControl() }

    func updateUIView(_ view: StandalonePageCounterHoldControl, context: Context) {
        view.step = step
        view.isEnabled = enabled
        view.reduceMotion = reduceMotion
        view.title.text = symbol
        view.title.font = UIFont(
            name: "TestTheFuture-\(symbol == "+" ? "Black" : "Regular")",
            size: symbol == "+" ? 44 : 60
        ) ?? .systemFont(ofSize: symbol == "+" ? 44 : 60,
                         weight: symbol == "+" ? .black : .regular)
        view.accessibilityLabel = label
        view.accessibilityTraits = enabled ? .button : [.button, .notEnabled]
        view.alpha = enabled ? 1 : 0.3
    }

    static func dismantleUIView(_ view: StandalonePageCounterHoldControl, coordinator: ()) {
        view.stop()
    }
}

private final class StandalonePageCounterHoldControl: UIControl {
    let title = UILabel()
    var step: () -> Bool = { false }
    var reduceMotion = false
    private var timer: Timer?
    private var active = false
    private var repeated = false

    override var isEnabled: Bool { didSet { if !isEnabled { stop() } } }

    override init(frame: CGRect) {
        super.init(frame: frame)
        isAccessibilityElement = true
        isExclusiveTouch = true
        title.textAlignment = .center
        title.textColor = UIColor(white: 0.8, alpha: 1)
        title.isUserInteractionEnabled = false
        addSubview(title)
        for notification in [UIApplication.willResignActiveNotification, UIScene.willDeactivateNotification,
                             UIWindow.didResignKeyNotification, UITextField.textDidBeginEditingNotification] {
            NotificationCenter.default.addObserver(self, selector: #selector(stop), name: notification, object: nil)
        }
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
    override func layoutSubviews() { super.layoutSubviews(); title.frame = bounds.insetBy(dx: -4, dy: -12) }
    override func didMoveToWindow() { super.didMoveToWindow(); if window == nil { stop() } }

    override func beginTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard isEnabled else { return false }
        stop()
        active = true
        repeated = false
        let elapsed = max(0, ProcessInfo.processInfo.systemUptime - touch.timestamp)
        schedule(after: max(0, 0.280 - elapsed))
        title.transform = reduceMotion ? .identity : CGAffineTransform(scaleX: 0.92, y: 0.92)
        return true
    }

    override func continueTracking(_ touch: UITouch, with event: UIEvent?) -> Bool {
        guard bounds.contains(touch.location(in: self)) else { stop(); return false }
        return true
    }

    override func endTracking(_ touch: UITouch?, with event: UIEvent?) {
        let tap = active && !repeated && isEnabled && touch.map { bounds.contains($0.location(in: self)) } == true
        stop()
        if tap { _ = step() }
    }

    override func cancelTracking(with event: UIEvent?) { stop() }
    override func didUpdateFocus(in context: UIFocusUpdateContext, with coordinator: UIFocusAnimationCoordinator) {
        super.didUpdateFocus(in: context, with: coordinator)
        if context.previouslyFocusedView === self { stop() }
    }

    override func accessibilityActivate() -> Bool {
        guard isEnabled else { return false }
        _ = step()
        return true
    }

    private func schedule(after delay: TimeInterval) {
        let next = Timer(timeInterval: delay, repeats: false) { [weak self] _ in
            MainActor.assumeIsolated {
                guard let self, self.active, self.isEnabled else { return }
                self.repeated = true
                if self.step(), self.active, self.isEnabled { self.schedule(after: 0.075) }
                else { self.stop() }
            }
        }
        timer = next
        RunLoop.main.add(next, forMode: .common)
    }

    @objc func stop() {
        timer?.invalidate()
        timer = nil
        active = false
        title.transform = .identity
    }

    deinit { timer?.invalidate(); NotificationCenter.default.removeObserver(self) }
}

private struct StandalonePageCounterRollingDigits: UIViewRepresentable {
    let amount: Int
    let reduceMotion: Bool

    func makeUIView(context: Context) -> StandalonePageCounterDigitsView { StandalonePageCounterDigitsView() }
    func updateUIView(_ view: StandalonePageCounterDigitsView, context: Context) {
        view.update(amount: amount, reduceMotion: reduceMotion)
    }
}

/// At most two digit layers exist, even when repeating faster than a transition.
private final class StandalonePageCounterDigitsView: UIView {
    private var current: StandalonePageCounterDigitLayer?
    private var outgoing: StandalonePageCounterDigitLayer?
    private var amount = 0
    private var reduced = false

    override init(frame: CGRect) {
        super.init(frame: frame)
        clipsToBounds = false
        isUserInteractionEnabled = false
        isAccessibilityElement = true
        accessibilityTraits = .staticText
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }

    func update(amount: Int, reduceMotion: Bool) {
        let oldAmount = self.amount
        let motionChanged = reduced != reduceMotion
        self.amount = amount
        reduced = reduceMotion
        accessibilityLabel = "\(amount) pages"

        guard let previous = current, !motionChanged else {
            outgoing?.removeFromSuperlayer(); outgoing = nil
            current?.removeFromSuperlayer()
            current = digits(amount)
            return
        }
        guard oldAmount != amount else { return }

        outgoing?.removeFromSuperlayer()
        let transform = previous.presentation()?.transform ?? CATransform3DIdentity
        let opacity = previous.presentation()?.opacity ?? 1
        previous.removeAllAnimations()
        outgoing = previous
        let incoming = digits(amount)
        current = incoming
        let offset: CGFloat = reduced ? 0 : (amount > oldAmount ? 10 : -10)
        animate(previous, from: transform, to: CATransform3DMakeTranslation(0, -offset, 0), fromOpacity: opacity, toOpacity: 0)
        animate(incoming, from: CATransform3DMakeTranslation(0, offset, 0), to: CATransform3DIdentity, fromOpacity: 0, toOpacity: 1)
    }

    private func digits(_ value: Int) -> StandalonePageCounterDigitLayer {
        let gradient = StandalonePageCounterDigitLayer()
        gradient.frame = bounds
        gradient.colors = [UIColor(white: 0.98, alpha: 1).cgColor, UIColor(white: 0.58, alpha: 1).cgColor]
        gradient.startPoint = CGPoint(x: 0, y: 0.5)
        gradient.endPoint = CGPoint(x: 1, y: 0.5)
        let label = gradient.label
        label.frame = bounds
        label.text = String(value)
        label.font = UIFontMetrics(forTextStyle: .largeTitle).scaledFont(
            for: UIFont(name: "TestTheFuture-Medium", size: 82) ?? .systemFont(ofSize: 82, weight: .medium)
        )
        label.textAlignment = .center
        label.textColor = .white
        label.adjustsFontSizeToFitWidth = true
        label.minimumScaleFactor = 0.4
        gradient.mask = label.layer
        layer.addSublayer(gradient)
        return gradient
    }

    private func animate(_ target: CALayer, from: CATransform3D, to: CATransform3D, fromOpacity: Float, toOpacity: Float) {
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        target.transform = to
        target.opacity = toOpacity
        CATransaction.commit()
        let movement = CABasicAnimation(keyPath: "transform")
        movement.fromValue = NSValue(caTransform3D: from)
        movement.toValue = NSValue(caTransform3D: to)
        let fade = CABasicAnimation(keyPath: "opacity")
        fade.fromValue = fromOpacity
        fade.toValue = toOpacity
        let group = CAAnimationGroup()
        group.animations = [movement, fade]
        group.duration = reduced ? 0.09 : 0.18
        group.timingFunction = CAMediaTimingFunction(controlPoints: 0.2, 0.8, 0.2, 1)
        target.add(group, forKey: "amount")
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        for gradient in [current, outgoing].compactMap({ $0 }) {
            gradient.bounds = bounds
            gradient.position = CGPoint(x: bounds.midX, y: bounds.midY)
            gradient.label.frame = bounds
        }
        CATransaction.commit()
    }
}

private final class StandalonePageCounterDigitLayer: CAGradientLayer {
    // Retain the mask's UILabel, whose layer has a weak drawing delegate.
    let label = UILabel()
    override init() { super.init() }
    override init(layer: Any) { super.init(layer: layer) }
    required init?(coder: NSCoder) { fatalError("init(coder:) has not been implemented") }
}
