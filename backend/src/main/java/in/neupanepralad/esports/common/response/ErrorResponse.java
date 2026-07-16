package in.neupanepralad.esports.common.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Map;

@Getter
@Builder
public class ErrorResponse {
    @Builder.Default
    private final boolean success = false;
    
    private final String message;
    
    // Supports field-level validation messages
    private final Map<String, String> errors;
    
    private final String path;
    
    private final int status;
    
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now(ZoneId.of("UTC"));
}
