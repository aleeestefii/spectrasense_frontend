//Functionality: This code displays the home page from our website.
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative grid grid-rows-[1fr_auto_20px] items-center justify-items-center min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Video de portada */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
        src="/PORTADA.MP4"
        alt="Portada video"
        autoPlay
        loop
        muted
        playsInline
      />

      
      <main className="relative flex flex-col gap-8 row-start-2 items-center sm:items-start z-10 text-white mt-auto">  
        <ol className="list-center text-3xl text-center sm:text-left  font-serif">
          <li className="mb-2">
            La tierra habla en datos,{" "}
            <code className="text-blue-400  px-1 py-0.5 rounded font-semibold font-bold font-serif ">
              Nosotros lo traducimos
            </code>
          </li>
        </ol>

        
        <div className="flex justify-center text-center bg-red w-full z-10">
  <a
    className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-30 sm:h-30 px-15 sm:px-6"
    href="/landsat-page"
    rel="noopener noreferrer"
  >
    <Image
      className="dark:invert"
      src="https://nextjs.org/icons/vercel.svg"
      alt="Vercel logomark"
      width={30}
      height={30}
    />
    ¡LANDSAT!
  </a>
</div>
      </main>

      {/* Footer */}
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center relative z-10 mt-8"> 
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://landsat.gsfc.nasa.gov/benefits/"
          target="_blank"
          rel="noopener noreferrer"
        >

          LANDSAT
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://www.spaceappschallenge.org/nasa-space-apps-2024/find-a-team/star-two/?tab=details"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          WHO ARE WE: STAR-TWO
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://science.nasa.gov/mission/europa-clipper/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="https://nextjs.org/icons/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          NASA
        </a>
      </footer>
    </div>
  );
}
