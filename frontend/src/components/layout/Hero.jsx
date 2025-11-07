
import { useTranslation } from 'react-i18next';

export default function Hero() {
  const { t } = useTranslation();
  
  return (
    <section
      className="relative w-full h-[600px] flex flex-col items-center justify-center gap-6 px-6 text-center font-inter text-white"
      style={{
        backgroundImage: `url('')`, // leave empty for now
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "top",
      }}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#00b4db]/60 to-[#0083b0]/60 z-0"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center gap-6">
        {/* Heading */}
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
          {t('home.title')}
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-2xl font-semibold text-white/80 max-w-2xl">
          {t('home.subtitle')}
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-4 mt-4">
          {/* Primary Button */}
          <a
            href="/issues"
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full px-6 py-3 font-semibold shadow-lg"
          >
            {t('home.viewIssues')}
          </a>

          {/* Secondary Button */}
          <a
            href="/report"
            className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full shadow-lg p-[2px]"
          >
            <span className="bg-white text-slate-900 rounded-full px-6 py-3 font-semibold block">
              {t('nav.report')}
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}








// export default function Hero() {
//   return (
//     <section
//       className="relative w-full h-[600px] flex flex-col items-center justify-center gap-6 px-6 text-center font-inter text-white"
//       style={{
//         backgroundImage: `url('')`, // leave empty for now
//         backgroundSize: "cover",
//         backgroundRepeat: "no-repeat",
//         backgroundPosition: "top",
//       }}
//     >
//       {/* Gradient Overlay */}
//       <div className="absolute inset-0 bg-gradient-to-tr from-[#00b4db]/60 to-[#0083b0]/60 z-0"></div>

//       {/* Content */}
//       <div className="relative z-10 flex flex-col items-center justify-center gap-6">
//         {/* Heading */}
//         <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
//           Report. Vote. Resolve.
//         </h1>

//         {/* Subtitle */}
//         <p className="text-lg md:text-2xl font-semibold text-white/80 max-w-2xl">
//           Empowering communities to fix problems together
//         </p>

//         {/* CTA Buttons */}
//         <div className="flex items-center justify-center gap-4 mt-4">
//           {/* Primary Button */}
//           <a
//             href="/issues"
//             className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full px-6 py-3 font-semibold shadow-lg"
//           >
//             View Issues
//           </a>

//           {/* Secondary Button */}
//           <a
//             href="/report"
//             className="bg-gradient-to-b from-[#00b4db] to-[#0083b0] rounded-full shadow-lg p-[2px]"
//           >
//             <span className="bg-white text-slate-900 rounded-full px-6 py-3 font-semibold block">
//               Report an Issue
//             </span>
//           </a>
//         </div>
//       </div>
//     </section>
//   );
// }
