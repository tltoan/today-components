import SwiftUI

/// A SwiftUI version of the supplied chart. iOS 17+.
/// Bars enter once, from left to right. Pass a new replayID to replay.
/// Sample data below is the screenshot fixture, not production records.
struct StaggeredBarChart: View {
    struct Point: Identifiable, Hashable {
        let id: String
        let dateLabel: String
        let value: Int? // nil means no log; zero remains a recorded value.
    }

    let points: [Point]
    var target: Int = 10
    var targetLabel: String = "10-page target"
    var unit: String = "pages"
    var replayID: Int = 0

    // Change stagger to 0.5 for strictly one-at-a-time bars with no overlap.
    var riseDuration: Double = 0.5
    var stagger: Double = 0.14
    var plotHeight: CGFloat = 144
    var font: Font = .custom("TestTheFuture-Regular", size: 12)

    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var revealed = false

    private let secondary = Color(red: 0.73, green: 0.73, blue: 0.77)
    private let ruleColor = Color(red: 0.34, green: 0.31, blue: 0.39)

    private var maximum: Double {
        max(Double(points.compactMap(\.value).max() ?? 0), Double(target) * 1.5, 1)
    }

    private var usableHeight: CGFloat { max(plotHeight - 24, 0) }

    private struct EntranceID: Hashable {
        let points: [Point]
        let target: Int
        let replay: Int
    }

    var body: some View {
        GeometryReader { geometry in
            let columnWidth = geometry.size.width / CGFloat(max(points.count, 1))
            let targetHeight = CGFloat(Double(target) / maximum) * usableHeight

            VStack(spacing: 0) {
                ZStack(alignment: .bottomLeading) {
                    // Static reference line and label behind the columns.
                    Rectangle()
                        .fill(ruleColor)
                        .frame(height: 0.5)
                        .offset(y: -targetHeight)
                    Text(targetLabel)
                        .font(font)
                        .foregroundStyle(secondary)
                        .padding(.bottom, targetHeight + 5)

                    HStack(alignment: .bottom, spacing: 0) {
                        ForEach(Array(points.enumerated()), id: \.element.id) { index, point in
                            column(point, index: index, width: columnWidth)
                        }
                    }

                    Rectangle()
                        .fill(ruleColor)
                        .frame(height: 0.5)
                        .accessibilityHidden(true)
                }
                .frame(height: plotHeight, alignment: .bottom)

                HStack(spacing: 0) {
                    ForEach(points) { point in
                        Text(point.dateLabel)
                            .font(font)
                            .foregroundStyle(secondary)
                            .frame(width: columnWidth, height: 28)
                    }
                }
                .accessibilityHidden(true) // Each column already announces its date.
            }
        }
        .frame(height: plotHeight + 28)
        .accessibilityElement(children: .contain)
        .task(id: EntranceID(points: points, target: target, replay: replayID)) {
            // Establish the zero-height state without animating a reset.
            var transaction = Transaction(animation: nil)
            transaction.disablesAnimations = true
            withTransaction(transaction) { revealed = reduceMotion }
            guard !reduceMotion else { return }

            // A cancellable frame boundary lets SwiftUI commit the initial state.
            do {
                try await Task.sleep(for: .milliseconds(30))
            } catch {
                return
            }
            guard !Task.isCancelled else { return }
            revealed = true
        }
        .onDisappear {
            var transaction = Transaction(animation: nil)
            transaction.disablesAnimations = true
            withTransaction(transaction) { revealed = false }
        }
    }

    private func column(_ point: Point, index: Int, width: CGFloat) -> some View {
        ZStack(alignment: .bottom) {
            if let value = point.value {
                let height = CGFloat(Double(max(value, 0)) / maximum) * usableHeight
                let hasEntered = revealed || reduceMotion
                let barWidth = min(40, max(0, width - 12))

                if value == 0 {
                    // A true zero is visible but never grows into a positive bar.
                    Rectangle()
                        .fill(gradient(targetMet: value >= target))
                        .frame(width: barWidth, height: 1)
                    Text("0")
                        .font(font)
                        .foregroundStyle(secondary)
                        .offset(y: -7)
                } else {
                    ZStack(alignment: .bottom) {
                        UnevenRoundedRectangle(
                            topLeadingRadius: 8,
                            bottomLeadingRadius: 0,
                            bottomTrailingRadius: 0,
                            topTrailingRadius: 8
                        )
                        .fill(gradient(targetMet: value >= target))
                        // Animate height, not scale: the corners retain their shape.
                        .frame(width: barWidth, height: hasEntered ? height : 0)

                        Text("\(value)")
                            .font(font)
                            .foregroundStyle(height >= 28 ? Color.black : secondary)
                            .offset(y: hasEntered ? (height >= 28 ? -height + 22 : -height - 6) : 0)
                            .opacity(hasEntered ? 1 : 0)
                    }
                    .animation(
                        reduceMotion ? nil : .timingCurve(0.22, 0.80, 0.28, 1, duration: riseDuration)
                            .delay(Double(index) * stagger),
                        value: revealed
                    )
                }
            } else {
                // Keep the empty position; do not fabricate a zero bar.
                Text("No log")
                    .font(font)
                    .foregroundStyle(secondary)
                    .padding(.bottom, 7)
            }
        }
        .frame(width: width, height: plotHeight, alignment: .bottom)
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(accessibilityLabel(for: point))
    }

    private func gradient(targetMet: Bool) -> LinearGradient {
        LinearGradient(
            colors: targetMet
                ? [Color(red: 0.62, green: 0.75, blue: 0.94), Color(red: 0.32, green: 0.42, blue: 0.57)]
                : [Color(red: 0.74, green: 0.68, blue: 0.85), Color(red: 0.42, green: 0.36, blue: 0.54)],
            startPoint: .top,
            endPoint: .bottom
        )
    }

    private func accessibilityLabel(for point: Point) -> String {
        guard let value = point.value else { return "\(point.dateLabel). No log." }
        return "\(point.dateLabel). \(value) \(unit). \(value >= target ? "Target met." : "Below target.")"
    }
}

extension StaggeredBarChart.Point {
    static let screenshotExample: [Self] = [
        .init(id: "2026-11-01", dateLabel: "Nov 1", value: 5),
        .init(id: "2026-11-03", dateLabel: "Nov 3", value: 10),
        .init(id: "2026-11-05", dateLabel: "Nov 5", value: 12),
        .init(id: "2026-11-08", dateLabel: "Nov 8", value: nil),
        .init(id: "2026-11-10", dateLabel: "Nov 10", value: 8),
        .init(id: "2026-11-12", dateLabel: "Nov 12", value: 15)
    ]
}

/// Use this in an Xcode canvas or temporarily mount it in a preview screen.
struct StaggeredBarChartDemo: View {
    @State private var replayID = 0

    var body: some View {
        VStack(alignment: .leading, spacing: 24) {
            HStack(alignment: .firstTextBaseline, spacing: 10) {
                Text("50")
                    .font(.custom("TestTheFuture-Medium", size: 40))
                    .foregroundStyle(.white)
                Text("pages logged")
                    .font(.custom("TestTheFuture-Regular", size: 16))
                    .foregroundStyle(Color(white: 0.73))
            }

            StaggeredBarChart(points: StaggeredBarChart.Point.screenshotExample, replayID: replayID)

            Button("Replay animation") { replayID += 1 }
                .font(.custom("TestTheFuture-Regular", size: 14))
                .tint(Color(red: 0.74, green: 0.68, blue: 0.85))
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        .background(.black)
        .preferredColorScheme(.dark)
    }
}
