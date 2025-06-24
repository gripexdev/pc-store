import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { categoryService } from "../services/categoryService";

const Home = () => {
    // State to hold fetched categories
    const [categories, setCategories] = useState([]); // No type annotation in .jsx
    // Loading and error states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Ref for the carousel container
    const carouselRef = useRef(null);
    // State to control auto-scroll pause
    const [isPaused, setIsPaused] = useState(false);

    // Fetch categories on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch all categories (large limit to get all)
                const data = await categoryService.getAllCategories(1, 100);
                setCategories(data.categories);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Auto-scroll effect for the carousel (restart at end)
    useEffect(() => {
        if (!carouselRef.current || categories.length === 0) return;
        let intervalId;
        // Function to scroll the carousel by one card width smoothly
        const scrollStep = () => {
            if (!carouselRef.current || isPaused) return;
            const el = carouselRef.current;
            // Find the width of one card (assume all cards are same width)
            const card = el.querySelector('.category-card');
            const cardWidth = card ? card.offsetWidth + 24 : 200; // 24px = space-x-6 gap
            // If at (or near) the end, reset to start (no animation)
            if (el.scrollLeft + el.offsetWidth >= el.scrollWidth - cardWidth) {
                el.scrollTo({ left: 0, behavior: "auto" });
            } else {
                el.scrollBy({ left: cardWidth, behavior: "smooth" }); // Smooth scroll by one card
            }
        };
        // Start interval for auto-scroll: 1 card every 1 second (1000ms)
        intervalId = setInterval(scrollStep, 1000);
        return () => clearInterval(intervalId);
    }, [isPaused, categories]);

    // Handlers to pause/resume auto-scroll on user interaction
    const handleMouseEnter = () => setIsPaused(true);
    const handleMouseLeave = () => setIsPaused(false);
    const handleScroll = () => {
        // Pause auto-scroll while user is scrolling, resume after short delay
        setIsPaused(true);
        if (handleScroll.timeout) clearTimeout(handleScroll.timeout);
        handleScroll.timeout = setTimeout(() => setIsPaused(false), 1000);
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Main heading */}
            <h1 className="text-4xl font-extrabold text-center text-blue-700 pt-10 mb-2 tracking-tight">Welcome to PC Store</h1>
            <p className="text-center text-gray-600 mb-8">Find the best PC components and accessories</p>

            {/* Categories Carousel */}
            <section className="my-8 max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Browse by Category</h2>
                {loading ? (
                    <div className="py-8 flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : error ? (
                    <div className="py-8 text-red-600 text-center">{error}</div>
                ) : (
                    <div className="relative">
                        {/* Horizontal scrollable carousel with auto-scroll and manual scroll */}
                        <div
                            ref={carouselRef}
                            className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 snap-x snap-mandatory"
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                            onScroll={handleScroll}
                            style={{ scrollBehavior: 'smooth' }}
                        >
                            {categories.map((cat, idx) => (
                                <div
                                    key={cat._id + '-' + idx}
                                    className="category-card flex-shrink-0 w-48 cursor-pointer bg-white rounded-xl border border-gray-200 p-6 flex flex-col items-center group snap-center transition-all duration-300 hover:shadow-xl hover:-translate-y-2 relative"
                                    onClick={() => navigate(`/category/${cat._id}`)}
                                    title={cat.name}
                                >
                                    {/* Purple parallelogram background using CSS pseudo-element */}
                                    <div className="relative flex items-center justify-center mb-3 w-36 h-28">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-32 h-24 bg-gradient-to-br from-purple-500 to-purple-300 rounded-lg transform -skew-x-12 opacity-80"></div>
                                        </div>
                                        {/* Category image, object-contain for best fit, now larger */}
                                        {cat.image ? (
                                            <img src={cat.image} alt={cat.name} className="relative z-10 w-32 h-20 object-contain" />
                                        ) : (
                                            <span className="relative z-10 text-gray-400 text-4xl">?</span>
                                        )}
                                    </div>
                                    {/* Category name with always-visible underline, animates width on hover */}
                                    <div className="mt-2 text-center font-bold text-gray-900 uppercase tracking-wide text-base group-hover:text-purple-700 transition-colors duration-200">
                                        {cat.name}
                                        <div className="h-1 mt-1 flex justify-center">
                                            <span className={"block w-1/4 group-hover:w-3/4 transition-all duration-300 border-b-4 border-purple-600 rounded-full"}></span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Subtle fade on edges for better UX */}
                        <div className="pointer-events-none absolute top-0 left-0 h-full w-8 bg-gradient-to-r from-gray-50 to-transparent" />
                        <div className="pointer-events-none absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-50 to-transparent" />
                    </div>
                )}
            </section>

            {/* Placeholder for rest of landing page */}
            <div className="max-w-2xl mx-auto text-center mt-16">
                <p className="text-lg text-gray-700 mb-2">Here you can find various features and functionalities.</p>
                <p className="text-gray-500">Feel free to explore and enjoy your stay!</p>
            </div>
        </div>
    );
};

export default Home;
