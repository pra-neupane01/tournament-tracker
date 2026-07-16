package in.neupanepralad.esports.game.dto;

import in.neupanepralad.esports.game.model.GamePlatform;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record GameRequest(
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Size(max = 100)
        @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$") String slug,
        @NotNull GamePlatform platform,
        @Min(1) @Max(100) int teamSize,
        @Min(0) @Max(100) int substituteLimit,
        @Size(max = 2000) String description,
        boolean active
) {
}
