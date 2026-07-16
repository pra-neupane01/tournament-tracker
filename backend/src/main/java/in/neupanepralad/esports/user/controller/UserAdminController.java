package in.neupanepralad.esports.user.controller;

import in.neupanepralad.esports.auth.dto.UserResponse;
import in.neupanepralad.esports.common.pagination.PagedResponse;
import in.neupanepralad.esports.common.response.APIResponse;
import in.neupanepralad.esports.user.dto.UserAdminUpdateRequest;
import in.neupanepralad.esports.user.service.UserAdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class UserAdminController {

    private final UserAdminService userAdminService;

    @GetMapping
    public APIResponse<PagedResponse<UserResponse>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return APIResponse.success("Users retrieved", userAdminService.list(page, size));
    }

    @GetMapping("/{userId}")
    public APIResponse<UserResponse> get(@PathVariable UUID userId) {
        return APIResponse.success("User retrieved", userAdminService.get(userId));
    }

    @PatchMapping("/{userId}")
    public APIResponse<UserResponse> update(
            @PathVariable UUID userId,
            @Valid @RequestBody UserAdminUpdateRequest request
    ) {
        return APIResponse.success("User updated", userAdminService.update(userId, request));
    }
}
