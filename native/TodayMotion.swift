import SwiftUI

/// Today motion tokens. Dropdown/disclosure motion approved November 20, 2026.
/// These are reusable native definitions; importing them does not migrate app UI.
public enum TodayMotion {
    public enum Disclosure {
        public static let duration: Double = 0.600
        public static let enterDuration: Double = 0.380
        public static let enterDelay: Double = 0.120
        public static let exitDuration: Double = 0.230
        public static let chevronDuration: Double = 0.440

        public static var layout: Animation {
            .timingCurve(0.37, 0, 0.18, 1, duration: duration)
        }
        public static var contentIn: Animation {
            .timingCurve(0.25, 0.1, 0.25, 1, duration: enterDuration).delay(enterDelay)
        }
        public static var contentOut: Animation {
            .timingCurve(0.25, 0.1, 0.25, 1, duration: exitDuration)
        }
        public static var chevron: Animation {
            .timingCurve(0.37, 0, 0.18, 1, duration: chevronDuration)
        }
        public static func layout(reduceMotion: Bool) -> Animation? {
            reduceMotion ? nil : layout
        }
    }

    /// Current agenda proposal, awaiting feedback on its new settling behavior.
    public enum Agenda {
        public static let settleDuration: Double = 0.680
        public static var settle: Animation {
            .timingCurve(0.22, 0.68, 0.24, 1, duration: settleDuration)
        }
    }
}
