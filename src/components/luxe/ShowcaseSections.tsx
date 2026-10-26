import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Quote } from "lucide-react";
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
import { serviceShowcase, testimonials } from "@/lib/content";

/** Images inside a card crossfade to the next one on a timer. */
function RotatingImages({ images, interval = 2800 }: { images: string[]; interval?: number }) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % images.length), interval);
    return () => clearInterval(id);
  }, [images.length, interval]);

  return (
    <div className="relative aspect-3/4 overflow-hidden">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt=""
          loading="lazy"
          className={`absolute inset-0 size-full object-cover transition-opacity duration-[1.2s] ease-in-out ${
            i === active ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-transparent" />
    </div>
  );
}

export function Portfolio() {
  const [cardIndex, setCardIndex] = useState<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  useEffect(() => {
    if (!api) return;
    const id = setInterval(() => api.scrollNext(), 4000);
    return () => clearInterval(id);
  }, [api]);

  const card = cardIndex === null ? null : serviceShowcase[cardIndex];
  const lightboxItems = card
    ? card.images.map((image) => ({ image, title: card.title }))
    : [];

  return (
    <section className="bg-section py-24 md:py-36">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <SectionHeading eyebrow="Portfolio" title="Selected celebrations" />

        <Carousel setApi={setApi} opts={{ align: "start", loop: true }} className="mt-16 md:mt-24">
          <CarouselContent className="-ml-4">
            {serviceShowcase.map((c, i) => (
              <CarouselItem key={c.title} className="pl-4 sm:basis-1/2 lg:basis-1/3">
                <button
                  onClick={() => {
                    setCardIndex(i);
                    setImageIndex(0);
                  }}
                  aria-label={`Open ${c.title} gallery`}
                  className="group relative block w-full overflow-hidden rounded-xl border border-border text-left"
                >
                  <RotatingImages images={c.images} />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
                    <div>
                      <h3 className="text-xl text-ivory md:text-2xl">{c.title}</h3>
                      <p className="mt-1.5 text-[0.6rem] tracking-[0.26em] text-muted-foreground uppercase">
                        View gallery
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
        items={lightboxItems}
        index={card && imageIndex < card.images.length ? imageIndex : null}
        onClose={() => setCardIndex(null)}
        onIndexChange={setImageIndex}
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
        </div>
      </div>
    </section>
  );
}
