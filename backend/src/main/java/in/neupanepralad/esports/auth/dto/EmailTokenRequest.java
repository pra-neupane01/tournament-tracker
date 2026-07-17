package in.neupanepralad.esports.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record EmailTokenRequest(@NotBlank String token) {}
