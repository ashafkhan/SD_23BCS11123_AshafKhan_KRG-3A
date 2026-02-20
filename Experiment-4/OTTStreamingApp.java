import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

/*
 * 1. Streaming Contract
 * Defines the common interface for both real object and proxy
 */
interface StreamService {
    void stream(String contentId);
}

/*
 * 2. Actual Streaming Engine
 * Represents a heavy object connected to cloud/BLOB storage
 */
class CloudStreamEngine implements StreamService {
    private String playlistFile;

    public CloudStreamEngine(String playlistFile) {
        this.playlistFile = playlistFile;
        connectToCloud();
    }

    private void connectToCloud() {
        System.out.println("[Cloud Storage] Initializing secure high-speed connection...");
        System.out.println("[Cloud Storage] Preloading stream chunks from: " + playlistFile);
    }

    @Override
    public void stream(String contentId) {
        System.out.println("[Playback] Content " + contentId + " streaming via " + playlistFile);
    }
}

/*
 * 3. Proxy Layer
 * Handles metadata access and defers heavy resource creation
 */
class StreamProxy implements StreamService {

    private CloudStreamEngine engine;
    private static Map<String, StreamInfo> database = new HashMap<>();

    static {
        // Simulated NoSQL metadata store
        database.put(
            "vid_101",
            new StreamInfo("System Design Fundamentals", "Intro to HLD concepts", "playlist.m3u8")
        );
    }

    @Override
    public void stream(String contentId) {

        // Lightweight metadata fetch
        StreamInfo info = database.get(contentId);

        if (info == null) {
            System.out.println("❌ Metadata unavailable for requested content.");
            return;
        }

        System.out.println("\n===== Video Details (Fetched from DB) =====");
        System.out.println("Title       : " + info.title);
        System.out.println("Description : " + info.description);
        System.out.println("Playlist    : " + info.playlist);
        System.out.println("===========================================\n");

        // User confirmation before initializing heavy object
        Scanner input = new Scanner(System.in);
        System.out.print("Enter 'P' to begin streaming from cloud: ");
        String response = input.next();

        if (response.equalsIgnoreCase("p")) {
            if (engine == null) {
                engine = new CloudStreamEngine(info.playlist);
            }
            engine.stream(contentId);
        } else {
            System.out.println("ℹ Streaming aborted. Cloud resources not allocated.");
        }

        input.close();
    }
}

/*
 * Metadata holder class
 */
class StreamInfo {
    String title;
    String description;
    String playlist;

    StreamInfo(String title, String description, String playlist) {
        this.title = title;
        this.description = description;
        this.playlist = playlist;
    }
}

/*
 * 4. Client Application
 */
public class OTTStreamingApp {
    public static void main(String[] args) {

        StreamService player = new StreamProxy();

        // Client interacts only with proxy
        player.stream("vid_101");
    }
}
