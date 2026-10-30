import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { isEnvBrowser, useNuiEvent } from "fivem-nui-react";
import type { AlertCard } from "../../resource/common/nui";
import { Card } from "./Card";
import { MOCK_CARDS, MOCK_TEXTS } from "./dev/mock";
import { setTexts } from "./lib/lang";

/** At most this many cards on screen; older ones leave first. */
const MAX_CARDS = 4;

/** Police alert cards on the right: newest on top, each leaves after its card time (client clock) or when removed. */
export function App() {
  const [cards, setCards] = useState<AlertCard[]>([]);

  useNuiEvent<Record<string, string>>("texts", setTexts);
  useNuiEvent<AlertCard>("add", (card) =>
    setCards((list) =>
      [card, ...list.filter((c) => c.id !== card.id)].slice(0, MAX_CARDS),
    ),
  );
  useNuiEvent<number>("remove", (id) =>
    setCards((list) => list.filter((c) => c.id !== id)),
  );
  useNuiEvent("clear", () => setCards([]));

  // Browser preview: three alerts from the mock.
  useEffect(() => {
    if (!isEnvBrowser()) return;
    setTexts(MOCK_TEXTS);
    setCards(MOCK_CARDS);
  }, []);

  const hide = (id: number) =>
    setCards((list) => list.filter((c) => c.id !== id));

  return (
    <div className="pointer-events-none fixed top-[24vh] right-[1.6vh] flex w-[38vh] flex-col items-end gap-[1vh]">
      <AnimatePresence initial={false}>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            layout
            initial={{ x: "120%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "120%", opacity: 0, transition: { duration: 0.2 } }}
            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
            className="w-full"
          >
            <Card card={card} newest={index === 0} onDone={hide} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
