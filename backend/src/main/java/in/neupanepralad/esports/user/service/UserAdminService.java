package in.neupanepralad.esports.user.service;

import in.neupanepralad.esports.auth.dto.UserResponse;
import in.neupanepralad.esports.common.exception.ResourceNotFoundException;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.user.dto.UserAdminUpdateRequest;
import in.neupanepralad.esports.user.model.User;
import in.neupanepralad.esports.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserAdminService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> list(int page, int size) {
        return PagedResponse.of(
                userRepository.findAll(PageRequest.of(
                                Math.max(0, page),
                                Math.min(Math.max(size, 1), 100),
                                Sort.by(Sort.Direction.DESC, "createdAt")
                        ))
                        .map(UserResponse::from)
        );
    }

    @Transactional(readOnly = true)
    public UserResponse get(UUID userId) {
        return UserResponse.from(requireUser(userId));
    }

    @Transactional
    public UserResponse update(UUID userId, UserAdminUpdateRequest request) {
        User user = requireUser(userId);
        user.setRole(request.role());
        user.setEnabled(request.enabled());
        user.setLocked(request.locked());
        return UserResponse.from(user);
    }

    private User requireUser(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
