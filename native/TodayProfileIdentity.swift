import SwiftUI

/// Confirmed identity shared by onboarding, Profile, Home and party members.
/// Dependencies: PlayfulFaces.swift, TodayPartyAvatars.swift, TodayFacePicker.swift.
/// The app supplies persistence/upload; no simulated account save is built in.
struct TodayProfileIdentity: Codable, Equatable {
    var id: String
    var displayName: String
    var portrait = TodayFaceSelection()
    var photoData: Data? = nil

    func member(isYou: Bool = true) -> TodayPartyMember {
        let initials = displayName.split(separator: " ").prefix(2)
            .compactMap(\.first).map(String.init).joined().uppercased()
        return TodayPartyMember(id: id, name: displayName, initials: initials,
            gradientIndex: portrait.safeIndex, isYou: isYou,
            faceStyle: portrait.safeStyle.rawValue.lowercased(), photoData: photoData)
    }
}

/// Own one instance above the onboarding / Profile / party routes.
/// Inject it with environmentObject. The current user's stable ID is authoritative.
@MainActor final class TodayProfileIdentityStore: ObservableObject {
    @Published private(set) var confirmed: TodayProfileIdentity
    private let persist: (TodayProfileIdentity) async throws -> Void
    init(confirmed: TodayProfileIdentity,
         persist: @escaping (TodayProfileIdentity) async throws -> Void) {
        self.confirmed = confirmed
        self.persist = persist
    }
    func save(_ draft: TodayProfileIdentity) async throws {
        var next = draft
        next.id = confirmed.id
        try await persist(next)
        confirmed = next // Never publish a draft or a failed save.
    }
    func members(_ roster: [TodayPartyMember]) -> [TodayPartyMember] {
        roster.map { $0.id == confirmed.id ? confirmed.member() : $0 }
    }
}

/// Use after Features and before Describe; also reuse inside Edit profile.
/// Parent owns navigation. onSaved advances onboarding only after persistence succeeds.
struct TodayProfilePortraitStep: View {
    @EnvironmentObject private var identity: TodayProfileIdentityStore
    @State private var draft: TodayProfileIdentity?
    @State private var saving = false
    @State private var error: String?
    var onSaved: () -> Void = {}

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                Text("YOUR PICTURE").font(.caption).foregroundStyle(.secondary)
                Text("Choose your look").font(.largeTitle.weight(.semibold))
                Text("For your profile and habit parties.").foregroundStyle(.secondary)
                if let value = draft {
                    TodayFacePicker(selection: Binding(get: { draft?.portrait ?? value.portrait },
                        set: { draft?.portrait = $0 }),
                        photoData: Binding(get: { draft?.photoData }, set: { draft?.photoData = $0 }),
                        layout: .portrait, displayName: value.displayName)
                }
                if let error { Text(error).font(.callout).accessibilityLabel(error) }
                Button(saving ? "Saving…" : "Save profile") {
                    guard let value = draft, !saving else { return }
                    saving = true
                    error = nil
                    Task { @MainActor in
                        do { try await identity.save(value); saving = false; onSaved() }
                        catch { self.error = "Couldn’t save your profile. Try again."; saving = false }
                    }
                }
                .buttonStyle(.borderedProminent).controlSize(.large)
                .disabled(saving || draft == nil)
                Text("You can change it later.").font(.caption).foregroundStyle(.secondary)
            }
            .padding(24)
            .disabled(saving)
        }
        .onAppear { if draft == nil { draft = identity.confirmed } }
    }
}

// Profile: TodayProfileAvatar(member: identity.confirmed.member())
// Party: TodayAvatarStack(members: identity.members(roster))
// Observe the same store in both parents with @EnvironmentObject.
// The host restores confirmed identity from its account store on launch.
