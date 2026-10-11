import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Quote, Star } from "lucide-react";
import { Reveal } from "@/components/luxe/Reveal";
import { SectionHeading } from "@/components/luxe/SectionHeading";
import { Lightbox } from "@/components/luxe/Lightbox";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { portfolio, testimonials } from "@/lib/content";

export function Portfolio() {
  const [index, setIndex] = useState<number | null>(null);
  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [api]);

  return (
    <section className="bg-section py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeading eyebrow="Portfolio" title="Selected celebrations" />

        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="mt-16 md:mt-24">
          <CarouselContent className="-ml-5">
            {portfolio.map((p, i) => (
              <CarouselItem key={p.title} className="pl-5 sm:basis-3/4 lg:basis-1/2">
                <button
                  onClick={() => setIndex(i)}
                  aria-label={`Open ${p.title}`}
                  className="group relative block w-full overflow-hidden rounded-xl border border-border text-left"
                >
                  <div className="aspect-4/3 overflow-hidden">
                    <img
                      src={p.image}
                      alt={`${p.title} — ${p.category}`}
                      loading="lazy"
                      className="size-full object-cover transition-transform duration-[1.4s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8">
                    <div>
                      <h3 className="text-3xl text-ivory">{p.title}</h3>
                      <p className="mt-2 text-[0.68rem] tracking-[0.26em] text-muted-foreground uppercase">
                        {p.category}
                      </p>
                    </div>
                    <ArrowUpRight className="size-5 shrink-0 text-gold transition-transform duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" />
                  </div>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="mt-10 flex justify-end gap-3">
            <CarouselPrevious className="static size-12 translate-y-0 rounded-none border-border bg-transparent text-ivory hover:border-gold hover:bg-gold/10 hover:text-gold" />
            <CarouselNext className="static size-12 translate-y-0 rounded-none border-border bg-transparent text-ivory hover:border-gold hover:bg-gold/10 hover:text-gold" />
          </div>
        </Carousel>
      </div>

      <Lightbox
        items={portfolio}
        index={index}
        onClose={() => setIndex(null)}
        onIndexChange={setIndex}
      />
    </section>
  );
}

export function Testimonials() {
  const [active, setActive] = useState(0);
  const item = testimonials[active]!;
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % testimonials.length), 6000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative overflow-hidden bg-section py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeading eyebrow="Clients" title="In their words" />

        <div className="relative mx-auto mt-16 max-w-3xl md:mt-24">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel relative rounded-2xl p-9 text-center md:p-16"
          >
            <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(30rem_20rem_at_50%_0%,oklch(0.784_0.086_84_/_0.12),transparent_70%)]" />
            <Quote className="relative mx-auto size-9 text-gold/60" />
            <blockquote className="relative mt-8 text-[clamp(1.35rem,2.6vw,2.1rem)] leading-[1.5] text-ivory">
              {item.quote}
            </blockquote>
            <div className="relative mt-10 flex items-center justify-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                loading="lazy"
                className="size-14 rounded-full border border-border object-cover"
              />
              <div className="text-left">
                <p className="text-sm text-ivory">{item.name}</p>
                <p className="mt-1 text-[0.66rem] tracking-[0.24em] text-muted-foreground uppercase">
                  {item.role}
                </p>
              </div>
            </div>
          </motion.div>

          <div className="mt-10 flex items-center justify-center gap-3">
            {testimonials.map((t, i) => (
              <button
                key={t.name}
                onClick={() => setActive(i)}
                aria-label={`Show testimonial from ${t.name}`}
                className={`h-px w-12 transition-colors duration-500 ${
                  i === active ? "bg-gold" : "bg-border"
                }`}
              />
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-14 flex items-center justify-center gap-4 text-[0.66rem] tracking-[0.24em] text-muted-foreground uppercase">
              <span className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3 fill-current" />
                ))}
              </span>
              Video testimonials available on request
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

