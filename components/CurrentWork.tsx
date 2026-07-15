import { currentWork } from "@/lib/content";
import CornerCard from "./CornerCard";
import LogKicker from "./LogKicker";
import StatusLine from "./StatusLine";
import Waveform from "./Waveform";
import SectionHeader from "./SectionHeader";

export default function CurrentWork() {
  return (
    <section id="current-work" className="py-24">
      <SectionHeader index="current_work" title="current work" />
      <p className="text-secondary text-[15px] max-w-xl mb-10 -mt-4">
        Two labs, one throughline: sensing hardware and learned models that
        act on real bodies in real time.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {currentWork.map((item) => (
          <CornerCard key={item.logIndex}>
            <LogKicker index={item.logIndex} label={item.org} />
            <h3 className="text-graphite font-medium text-base mb-1.5">
              {item.title}
            </h3>
            <p className="text-secondary text-sm mb-4">{item.description}</p>
            <Waveform variant={item.waveform} className="mb-4" />
            <StatusLine
              status={item.status}
              dateRange={item.dateRange}
              suffix={item.statusDetail}
            />
            <div className="reveal mt-2">
              <p className="font-mono text-[11px] text-muted">
                {item.detail}
              </p>
            </div>
          </CornerCard>
        ))}
      </div>
    </section>
  );
}
