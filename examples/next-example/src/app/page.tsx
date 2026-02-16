export default function Home() {
  return (
    <div className="relative isolate overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.slate.100),theme(colors.white))] opacity-20" />
      <div className="absolute inset-y-0 right-1/2 -z-10 mr-16 w-[200%] origin-bottom-left skew-x-[-30deg] bg-white shadow-xl shadow-blue-600/10 ring-1 ring-blue-50 sm:mr-28 lg:mr-0 xl:mr-16 xl:origin-center" />

      <section className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 hover:ring-slate-900/20">
              Announcing the new version <a href="#" className="font-semibold text-primary"><span className="absolute inset-0" aria-hidden="true" />Read more <span aria-hidden="true">&rarr;</span></a>
            </div>
          </div>
          
          <h1 className="font-heading text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
            Browser-to-IDE Bridge
          </h1>
          
          <p className="mt-6 text-lg leading-8 text-slate-600 font-sans max-w-xl mx-auto">
            Experience the seamless flow of creativity. OpenUI connects your vision directly to your codebase.
          </p>
          
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <a href="#" className="rounded-md bg-primary px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-all duration-300">
              Get started
            </a>
            <a href="#" className="text-sm font-semibold leading-6 text-slate-900">
              Learn more <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-20 shadow-2xl sm:px-10 sm:py-24 md:px-12 lg:px-20">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-blue-500/20 to-transparent blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-gradient-to-tr from-blue-500/20 to-transparent blur-3xl" />
          
          <div className="relative">
            <div className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left">
              <h2 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
                The Story of Pixel
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Once upon a time, in a digital realm far beyond our screens, there lived a young line of code named <span className="text-blue-400 font-semibold">Pixel</span>. Pixel was different from other code snippets — while they were content being static and predictable, Pixel dreamed of creating beautiful animations and delightful user experiences.
              </p>
              
              <div className="my-8 h-px w-full bg-slate-700/50" />
              
              <p className="text-lg leading-relaxed text-slate-300">
                One day, Pixel met a wise old JavaScript function who taught them about the magic of <span className="italic text-blue-300">transforms</span> and <span className="italic text-blue-300">transitions</span>. Excited by these new possibilities, Pixel began practicing day and night.
              </p>

              <blockquote className="mt-10 border-l-4 border-blue-500 pl-6 italic text-slate-400">
                "And so, Pixel's dream came true — they had transformed their corner of the web into a more beautiful and interactive place."
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Section Separator */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24">
         <div className="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-8">
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-heading text-2xl font-semibold text-slate-900">Craftsmanship</h3>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Every pixel is placed with intent. We believe in the power of subtle details to create profound experiences.
              </p>
            </div>
            <div className="border-t border-slate-200 pt-4">
              <h3 className="font-heading text-2xl font-semibold text-slate-900">Performance</h3>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Beauty should never compromise speed. Our designs are optimized for fluid interaction and instant response.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
}
