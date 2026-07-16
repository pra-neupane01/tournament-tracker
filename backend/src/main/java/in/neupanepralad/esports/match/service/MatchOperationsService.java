package in.neupanepralad.esports.match.service;

import in.neupanepralad.esports.common.exception.BadRequestException;
import in.neupanepralad.esports.common.exception.ConflictException;
import in.neupanepralad.esports.common.exception.ForbiddenException;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.competition.dto.FixtureParticipantResponse;
import in.neupanepralad.esports.competition.dto.FixtureResponse;
import in.neupanepralad.esports.competition.model.Fixture;
import in.neupanepralad.esports.competition.model.FixtureParticipant;
import in.neupanepralad.esports.competition.model.FixtureStatus;
import in.neupanepralad.esports.competition.repository.FixtureParticipantRepository;
import in.neupanepralad.esports.competition.repository.FixtureRepository;
import in.neupanepralad.esports.match.dto.CheckInResponse;
import in.neupanepralad.esports.match.dto.FixtureScheduleRequest;
import in.neupanepralad.esports.match.dto.MatchRoomRequest;
import in.neupanepralad.esports.match.dto.MatchRoomResponse;
import in.neupanepralad.esports.match.model.CheckInStatus;
import in.neupanepralad.esports.match.model.FixtureCheckIn;
import in.neupanepralad.esports.match.model.MatchRoom;
import in.neupanepralad.esports.match.repository.FixtureCheckInRepository;
import in.neupanepralad.esports.match.repository.MatchRoomRepository;
import in.neupanepralad.esports.match.security.RoomSecretCipher;
import in.neupanepralad.esports.registration.workflow.model.TournamentRegistration;
import in.neupanepralad.esports.registration.workflow.repository.TournamentRegistrationRepository;
import in.neupanepralad.esports.team.service.TeamAccessService;
import in.neupanepralad.esports.tournament.service.TournamentAccessService;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MatchOperationsService {

    private final FixtureRepository fixtureRepository;
    private final FixtureParticipantRepository participantRepository;
    private final MatchRoomRepository roomRepository;
    private final FixtureCheckInRepository checkInRepository;
    private final TournamentRegistrationRepository registrationRepository;
    private final TournamentAccessService tournamentAccessService;
    private final TeamAccessService teamAccessService;
    private final UserRepository userRepository;
    private final RoomSecretCipher roomSecretCipher;

    @Transactional
    public FixtureResponse schedule(
            UUID fixtureId,
            UUID actorId,
            FixtureScheduleRequest request
    ) {
        Fixture fixture = requireFixture(fixtureId);
        tournamentAccessService.requireManager(
                fixture.getStage().getTournament().getId(),
                actorId
        );
        validateSchedule(request);
        LocalDateTime requestedEnd = request.scheduledAt().plusMinutes(
                request.durationMinutes()
        );
        for (FixtureParticipant participant :
                participantRepository.findAllByFixtureIdOrderBySlotNumberAsc(fixtureId)) {
            for (FixtureParticipant existing :
                    participantRepository.findAllByRegistrationId(
                            participant.getRegistration().getId()
                    )) {
                Fixture other = existing.getFixture();
                if (other.getId().equals(fixtureId) || other.getScheduledAt() == null
                        || other.getStatus() == FixtureStatus.CANCELLED) {
                    continue;
                }
                LocalDateTime otherEnd = other.getScheduledAt()
                        .plusMinutes(other.getDurationMinutes());
                if (request.scheduledAt().isBefore(otherEnd)
                        && other.getScheduledAt().isBefore(requestedEnd)) {
                    throw new ConflictException(
                            participant.getRegistration().getTeam().getName()
                                    + " has an overlapping fixture"
                    );
                }
            }
        }
        fixture.setScheduledAt(request.scheduledAt());
        fixture.setDurationMinutes(request.durationMinutes());
        fixture.setCheckInOpensAt(request.checkInOpensAt() == null
                ? request.scheduledAt().minusMinutes(30)
                : request.checkInOpensAt());
        fixture.setCheckInClosesAt(request.checkInClosesAt() == null
                ? request.scheduledAt()
                : request.checkInClosesAt());
        fixture.setVenue(request.venue());
        fixture.setStreamUrl(request.streamUrl());
        fixture.setStatus(FixtureStatus.SCHEDULED);
        return toFixtureResponse(fixture);
    }

    @Transactional
    public MatchRoomResponse saveRoom(
            UUID fixtureId,
            UUID actorId,
            MatchRoomRequest request
    ) {
        Fixture fixture = requireFixture(fixtureId);
        tournamentAccessService.requireManager(
                fixture.getStage().getTournament().getId(),
                actorId
        );
        MatchRoom room = roomRepository.findByFixtureId(fixtureId)
                .orElseGet(MatchRoom::new);
        room.setFixture(fixture);
        room.setRoomCode(request.roomCode().trim());
        room.setEncryptedPassword(roomSecretCipher.encrypt(request.password()));
        room.setServerName(request.serverName());
        room.setInstructions(request.instructions());
        roomRepository.save(room);
        return toRoomResponse(room);
    }

    @Transactional(readOnly = true)
    public MatchRoomResponse getRoom(UUID fixtureId, UUID actorId) {
        Fixture fixture = requireFixture(fixtureId);
        requireFixtureAccess(fixture, actorId);
        MatchRoom room = roomRepository.findByFixtureId(fixtureId)
                .orElseThrow(() -> new ResourceNotFoundException("Match room not found"));
        return toRoomResponse(room);
    }

    @Transactional
    public CheckInResponse checkIn(
            UUID fixtureId,
            UUID registrationId,
            UUID actorId
    ) {
        Fixture fixture = requireFixture(fixtureId);
        TournamentRegistration registration = requireParticipantRegistration(
                fixtureId,
                registrationId
        );
        teamAccessService.requireManager(registration.getTeam().getId(), actorId);
        if (fixture.getScheduledAt() == null) {
            throw new BadRequestException("Fixture has not been scheduled");
        }
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        if (fixture.getCheckInOpensAt() != null && now.isBefore(fixture.getCheckInOpensAt())) {
            throw new BadRequestException("Fixture check-in has not opened");
        }
        if (fixture.getCheckInClosesAt() != null && now.isAfter(fixture.getCheckInClosesAt())) {
            throw new BadRequestException("Fixture check-in has closed");
        }
        FixtureCheckIn checkIn = checkInRepository.findByFixtureIdAndRegistrationId(
                        fixtureId,
                        registrationId
                )
                .orElseGet(FixtureCheckIn::new);
        checkIn.setFixture(fixture);
        checkIn.setRegistration(registration);
        checkIn.setCheckedInBy(requireUser(actorId));
        checkIn.setCheckedInAt(now);
        checkIn.setStatus(CheckInStatus.CHECKED_IN);
        return CheckInResponse.from(checkInRepository.save(checkIn));
    }

    @Transactional
    public CheckInResponse setCheckInStatus(
            UUID fixtureId,
            UUID registrationId,
            CheckInStatus status,
            UUID actorId
    ) {
        Fixture fixture = requireFixture(fixtureId);
        tournamentAccessService.requireManager(
                fixture.getStage().getTournament().getId(),
                actorId
        );
        TournamentRegistration registration = requireParticipantRegistration(
                fixtureId,
                registrationId
        );
        FixtureCheckIn checkIn = checkInRepository.findByFixtureIdAndRegistrationId(
                        fixtureId,
                        registrationId
                )
                .orElseGet(FixtureCheckIn::new);
        checkIn.setFixture(fixture);
        checkIn.setRegistration(registration);
        checkIn.setCheckedInBy(requireUser(actorId));
        checkIn.setCheckedInAt(LocalDateTime.now(ZoneOffset.UTC));
        checkIn.setStatus(status);
        return CheckInResponse.from(checkInRepository.save(checkIn));
    }

    @Transactional(readOnly = true)
    public List<CheckInResponse> listCheckIns(UUID fixtureId, UUID actorId) {
        Fixture fixture = requireFixture(fixtureId);
        tournamentAccessService.requireManager(
                fixture.getStage().getTournament().getId(),
                actorId
        );
        return checkInRepository.findAllByFixtureIdOrderByCheckedInAtAsc(fixtureId)
                .stream().map(CheckInResponse::from).toList();
    }

    private void requireFixtureAccess(Fixture fixture, UUID actorId) {
        try {
            tournamentAccessService.requireManager(
                    fixture.getStage().getTournament().getId(),
                    actorId
            );
            return;
        } catch (ForbiddenException ignored) {
            // Try participant team access below.
        }
        for (FixtureParticipant participant :
                participantRepository.findAllByFixtureIdOrderBySlotNumberAsc(fixture.getId())) {
            try {
                teamAccessService.requireManager(
                        participant.getRegistration().getTeam().getId(),
                        actorId
                );
                return;
            } catch (ForbiddenException ignored) {
                // Continue checking other participants.
            }
        }
        throw new ForbiddenException("Match room access is restricted to fixture participants");
    }

    private TournamentRegistration requireParticipantRegistration(
            UUID fixtureId,
            UUID registrationId
    ) {
        if (!participantRepository.existsByFixtureIdAndRegistrationId(
                fixtureId,
                registrationId
        )) {
            throw new BadRequestException("Registration is not assigned to this fixture");
        }
        return registrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
    }

    private void validateSchedule(FixtureScheduleRequest request) {
        LocalDateTime opens = request.checkInOpensAt() == null
                ? request.scheduledAt().minusMinutes(30)
                : request.checkInOpensAt();
        LocalDateTime closes = request.checkInClosesAt() == null
                ? request.scheduledAt()
                : request.checkInClosesAt();
        if (opens.isAfter(closes) || closes.isAfter(request.scheduledAt())) {
            throw new BadRequestException(
                    "Check-in must open before it closes and close by match time"
            );
        }
    }

    private FixtureResponse toFixtureResponse(Fixture fixture) {
        return FixtureResponse.from(
                fixture,
                participantRepository.findAllByFixtureIdOrderBySlotNumberAsc(fixture.getId())
                        .stream().map(FixtureParticipantResponse::from).toList()
        );
    }

    private MatchRoomResponse toRoomResponse(MatchRoom room) {
        return new MatchRoomResponse(
                room.getFixture().getId(),
                room.getRoomCode(),
                roomSecretCipher.decrypt(room.getEncryptedPassword()),
                room.getServerName(),
                room.getInstructions()
        );
    }

    private Fixture requireFixture(UUID fixtureId) {
        return fixtureRepository.findById(fixtureId)
                .orElseThrow(() -> new ResourceNotFoundException("Fixture not found"));
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
