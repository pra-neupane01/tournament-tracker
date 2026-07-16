package in.neupanepralad.esports.common.response;

import lombok.Getter;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Getter
public class APIResponse<T> {
    private final boolean success;
    private final String message;
    private final T data;
    private final LocalDateTime timestamp;

    private APIResponse(boolean success, String message, T data) {
        this.success = success;
        this.message = message;
        this.data = data;
        // Automatically inject the timestamp so controllers don't have to
        this.timestamp = LocalDateTime.now(ZoneId.of("UTC"));
    }

    public static <T> APIResponse<T> success(String message) {
        return new APIResponse<>(true, message, null);
    }

    public static <T> APIResponse<T> success(String message, T data) {
        return new APIResponse<>(true, message, data);
    }

    public static <T> APIResponse<T> failure(String message) {
        return new APIResponse<>(false, message, null);
    }
}
