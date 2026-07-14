package com.example.CourseRegistrationSystem.config;

import com.example.CourseRegistrationSystem.model.Course;
import com.example.CourseRegistrationSystem.repository.CourseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CourseRepository courseRepository;

    public DataSeeder(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    @Override
    public void run(String... args) {
        seed("FOR201", "Forest Ecology & Conservation",
                "Study canopy structure, nutrient cycles, and conservation strategy through weekly field surveys in old-growth forest.",
                "Dr. Elena Marsh", 4, 28, "/images/forest-ecology.jpg", "Redwood Field Station");

        seed("BOT150", "Botany & Greenhouse Cultivation",
                "Hands-on plant science covering propagation, taxonomy, and greenhouse management of tropical and native species.",
                "Prof. Iris Cho", 3, 24, "/images/botany.jpg", "Campus Greenhouse Complex");

        seed("MAR310", "Marine Biology & Coral Reefs",
                "Explore reef ecosystems, coral health monitoring, and marine conservation with snorkel-based lab sessions.",
                "Dr. Marcus Tide", 4, 20, "/images/marine-biology.jpg", "Coastal Research Center");

        seed("GEO220", "Alpine Geology & Mountain Ecosystems",
                "Examine rock formation, glacial history, and high-altitude ecology on guided mountain-range expeditions.",
                "Dr. Anya Petrov", 3, 22, "/images/alpine-geology.jpg", "Highland Basecamp");

        seed("WLD240", "Wildlife Photography & Animal Behavior",
                "Learn field observation and ethical photography techniques while tracking behavior patterns of forest wildlife.",
                "Prof. Sam Okafor", 3, 18, "/images/wildlife.jpg", "Cedar Ridge Reserve");

        seed("AGR205", "Sustainable Agriculture & Soil Science",
                "Cover regenerative farming, soil composition, and crop rotation planning through work on the campus teaching farm.",
                "Dr. Priya Nandan", 3, 26, "/images/agriculture.jpg", "East Valley Teaching Farm");

        seed("AST101", "Astronomy & Night Sky Observation",
                "Introductory astronomy pairing lecture with telescope nights for tracking constellations, planets, and meteor showers.",
                "Prof. Owen Castillo", 3, 30, "/images/astronomy.jpg", "Ridgeline Observatory");

        seed("ORN180", "Ornithology & Bird Watching",
                "Identify regional bird species, migration patterns, and habitat needs through dawn birding walks.",
                "Dr. Naomi Fisk", 2, 20, "/images/ornithology.jpg", "Willowmere Wetlands"); 

        seed("RNF260", "Rainforest Ecology & Waterfalls",
                "Investigate biodiversity, hydrology, and canopy layers of tropical rainforest during an immersive field module.",
                "Dr. Felix Duarte", 4, 16, "/images/rainforest.jpg", "Emerald Canopy Site");

        seed("DES230", "Desert Ecology & Geology",
                "Study arid-land adaptation, canyon formation, and water scarcity solutions across multi-day desert transects.",
                "Prof. Lena Ahmadi", 3, 20, "/images/desert.jpg", "Red Mesa Field Camp");
    }

    private void seed(String code, String title, String description, String instructor,
                       int credits, int capacity, String imageUrl, String location) {
        if (!courseRepository.existsByCode(code)) {
            courseRepository.save(new Course(code, title, description, instructor, credits, capacity, imageUrl, location));
        }
    }
}
