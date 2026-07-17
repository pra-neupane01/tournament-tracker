package in.neupanepralad.esports.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailAddressRequest(@NotBlank @Email String email) {}
