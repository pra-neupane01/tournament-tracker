package in.neupanepralad.esports.match;

import in.neupanepralad.esports.match.security.RoomSecretCipher;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RoomSecretCipherTests {

    @Test
    void roomPasswordsAreEncryptedWithRandomizedAuthenticatedEncryption() {
        RoomSecretCipher cipher = new RoomSecretCipher(
                "test-secret-key-that-is-at-least-thirty-two-bytes"
        );

        String first = cipher.encrypt("room-pass");
        String second = cipher.encrypt("room-pass");

        assertThat(first).isNotEqualTo("room-pass").isNotEqualTo(second);
        assertThat(cipher.decrypt(first)).isEqualTo("room-pass");
        assertThat(cipher.decrypt(second)).isEqualTo("room-pass");
    }
}
