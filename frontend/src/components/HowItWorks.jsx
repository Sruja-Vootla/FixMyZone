import { FaRegEdit, FaThumbsUp, FaCheckCircle } from "react-icons/fa";

export default function HowItWorks() {
    return (
        <section
            id="how-it-works"
            className="w-full flex flex-col items-center justify-center gap-10 py-20 text-center text-white font-inter"
        >
            <h2 className="text-3xl md:text-4xl font-semibold">
                How It Works
            </h2>
            <div className="flex flex-col md:flex-row items-center justify-center gap-20">
                {/* Step 1 */}
                <div className="flex flex-col items-center gap-4 max-w-xs">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center text-3xl">
                        <FaRegEdit />
                    </div>
                    <h3 className="text-xl font-semibold">Report</h3>
                    <p className="text-gray-200 text-base leading-6">
                        Describe the issue in your neighborhood and submit it with location and photos.
                    </p>
                </div>
                {/* Step 2 */}
                <div className="flex flex-col items-center gap-4 max-w-xs">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center text-3xl">
                        <FaThumbsUp />
                    </div>
                    <h3 className="text-xl font-semibold">Vote</h3>
                    <p className="text-gray-200 text-base leading-6">
                        Support the issues that matter most to you by upvoting and sharing with others.
                    </p>
                </div>
                {/* Step 3 */}
                <div className="flex flex-col items-center gap-4 max-w-xs">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#43c6ac] to-[#191654] flex items-center justify-center text-3xl">
                        <FaCheckCircle />
                    </div>
                    <h3 className="text-xl font-semibold">Resolve</h3>
                    <p className="text-gray-200 text-base leading-6">
                        Track progress and updates until your community issue is resolved.
                    </p>
                </div>
            </div>
        </section>
    );
}