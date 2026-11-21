import SwiftUI

/// The shared party maximum is four people, including you.
/// Keep IDs stable. Gradient selection uses FNV-1a UTF-8 in browser and SwiftUI;
/// never use Swift's randomized hashValue or a member's position in the array.
struct TodayPartyMember: Identifiable {
    var id: String
    var name: String
    var initials: String
    var photoURL: URL? = nil
    var gradientIndex: Int? = nil
    var isYou = false
}

enum TodayAvatarPalette {
    static let maximumMembers = 4
    static let hexColors: [[UInt32]] = [
        [0x5468a6, 0x765b91, 0xb57771], [0x8d617d, 0x635b93, 0x435e89],
        [0x426d78, 0x52658f, 0x8072a5], [0x966b57, 0x8c607e, 0x565e96],
        [0x686098, 0x426e89, 0x618879], [0x8a657f, 0x6574a8, 0x446774]
    ]
    static func index(for id: String) -> Int {
        var hash: UInt32 = 2166136261
        for byte in id.utf8 { hash = (hash ^ UInt32(byte)) &* 16777619 }
        return Int(hash % UInt32(hexColors.count))
    }
    static func colors(for member: TodayPartyMember) -> [Color] {
        let raw = member.gradientIndex ?? index(for: member.id)
        let index = ((raw % hexColors.count) + hexColors.count) % hexColors.count
        return hexColors[index].map { hex in
            Color(red: Double((hex >> 16) & 255) / 255,
                  green: Double((hex >> 8) & 255) / 255,
                  blue: Double(hex & 255) / 255)
        }
    }
}

/// Photo when available; a stable varied gradient while absent, loading or failed.
struct TodayProfileAvatar: View {
    var member: TodayPartyMember
    var size: CGFloat = 36
    var rim: Color = Color(red: 23/255, green: 21/255, blue: 30/255)
    private var fallback: some View {
        LinearGradient(colors: TodayAvatarPalette.colors(for: member),
                       startPoint: .topLeading, endPoint: .bottomTrailing)
        .overlay {
            Text(member.initials).font(.system(size: size * 0.28, weight: .medium))
                .foregroundStyle(.white).shadow(color: .black.opacity(0.4), radius: 2, y: 1)
        }
    }
    var body: some View {
        ZStack {
            fallback
            if let url = member.photoURL {
                AsyncImage(url: url) { phase in
                    if let image = phase.image { image.resizable().scaledToFill() }
                }
            }
        }
        .frame(width: size, height: size).clipShape(Circle())
        .overlay(Circle().strokeBorder(rim, lineWidth: 2))
        .accessibilityLabel(member.name)
    }
}

/// Independent decoration. Wrap in a Button with at least a 44-point hit target.
/// Use the selected upper-right card-edge placement for app cards, not widget edges.
struct TodayAvatarStack: View {
    var members: [TodayPartyMember]
    var size: CGFloat = 36
    var body: some View {
        HStack(spacing: -size * 0.27) {
            ForEach(Array(members.prefix(TodayAvatarPalette.maximumMembers))) { member in
                TodayProfileAvatar(member: member, size: size)
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(members.prefix(4).map(\.name).joined(separator: ", "))
    }
}

/// Compact alternative: one profile + remaining member count, contained in bounds.
/// In a widget, place this entire view inside its content margins.
struct TodayLeadAvatar: View {
    var members: [TodayPartyMember]
    var preferredMemberID: String? = nil
    var size: CGFloat = 36
    private var shown: [TodayPartyMember] { Array(members.prefix(4)) }
    private var lead: TodayPartyMember? {
        shown.first { $0.id == preferredMemberID } ?? shown.first { !$0.isYou } ?? shown.first
    }
    var body: some View {
        Group {
            if let member = lead {
                TodayProfileAvatar(member: member, size: size)
                    .padding(.trailing, 12).padding(.bottom, 2)
                    .overlay(alignment: .bottomTrailing) {
                        if shown.count > 1 {
                            Text("+\(shown.count - 1)").font(.system(size: 10, weight: .medium))
                                .foregroundStyle(Color(red: 238/255, green: 234/255, blue: 243/255))
                                .frame(width: 24, height: 24)
                                .background(Color(red: 55/255, green: 49/255, blue: 67/255), in: Circle())
                                .overlay(Circle().strokeBorder(Color(red: 23/255, green: 21/255, blue: 30/255), lineWidth: 2))
                        }
                    }
            }
        }
        .accessibilityElement(children: .ignore)
        .accessibilityLabel(shown.map(\.name).joined(separator: ", "))
    }
}
