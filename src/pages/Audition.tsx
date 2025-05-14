import "./Audition.css";
import { useEffect, useState } from "react";

const INPUT_MAPPING: { [key: string]: string } = {
  ArrowLeft: "/AuditionPractice/Left.png",
  ArrowRight: "/AuditionPractice/Right.png",
  ArrowUp: "/AuditionPractice/Up.png",
  ArrowDown: "/AuditionPractice/Down.png",
};

function generateSequence(length: number) {
  const keys = Object.keys(INPUT_MAPPING);
  const sequence = [];

  for (let i = 0; i < length; i++) {
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    sequence.push([randomKey, INPUT_MAPPING[randomKey]]);
  }

  return sequence;
}

function Audition() {
  const [level, setLevel] = useState(1);
  const [sequence, setSequence] = useState(generateSequence(level));
  const [successRate, setSuccessRate] = useState(0);
  const [lastPressTime, setLastPressTime] = useState(Date.now());
  const [timeDifference, setTimeDifference] = useState(0);

  useEffect(() => {
    document
      .getElementsByName("sequence-bubble")
      .forEach((bubble) =>
        bubble?.classList.remove("bg-green-600", "bg-red-600")
      );
    setSequence(generateSequence(level));
    setLastPressTime(Date.now());
  }, [level]);

  useEffect(() => {
    let index = 0;
    let success = 0;

    const handleKeypress = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      if (e.key === " ") {
        if (lastPressTime !== null) {
          const diff = currentTime - lastPressTime;
          setTimeDifference(diff);
        }

        if (success === sequence.length) {
          setLevel(level + 1);
        } else {
          document
            .getElementsByName("sequence-bubble")
            .forEach((bubble) =>
              bubble?.classList.remove("bg-green-600", "bg-red-600")
            );
          setSequence(generateSequence(level));
          setLastPressTime(Date.now());
        }

        return;
      }

      if (e.key === sequence[index][0]) {
        document
          .getElementById(`sequence-bubble-${index}`)
          ?.classList.add("bg-green-600");
        success++;
      } else {
        document
          .getElementById(`sequence-bubble-${index}`)
          ?.classList.add("bg-red-600");
      }

      setSuccessRate(Math.floor((success / sequence.length) * 100));

      if (index !== sequence.length) {
        index++;
      }
    };

    document.addEventListener("keyup", handleKeypress);

    return () => {
      document.removeEventListener("keyup", handleKeypress);
    };
  }, [sequence]);

  return (
    <>
      <div className="mt-40 mb-10 space-y-20">
        <div className="hidden bg-[url(/AuditionPractice/Left.png)]"></div>
        <div className="hidden bg-[url(/AuditionPractice/Right.png)]"></div>
        <div className="hidden bg-[url(/AuditionPractice/Up.png)]"></div>
        <div className="hidden bg-[url(/AuditionPractice/Down.png)]"></div>
        <div className="flex justify-between">
          <input
            id="level"
            className="text-white"
            type="range"
            min="1"
            max="11"
            value={level}
            onChange={({ target: { value } }) => setLevel(Number(value))}
          />
          <div className="flex flex-col">
          <div className="text-white">SUCCESS RATE: {successRate}%</div>
          <div className="text-white">TIME: {timeDifference}ms</div>
          </div>
          <button
            onClick={() => {
              document
                .getElementsByName("sequence-bubble")
                .forEach((bubble) =>
                  bubble?.classList.remove("bg-green-600", "bg-red-600")
                );
              setSuccessRate(0);
              setLastPressTime(Date.now());
              setSequence(generateSequence(level));
            }}
            className="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
          >
            RESET
          </button>
        </div>
        <div className="flex justify-center">
          {sequence.map(([, img], index) => (
            <div
              // @ts-ignore
              name="sequence-bubble"
              id={`sequence-bubble-${index}`}
              key={index}
              className={`rounded-full w-32 h-32 shadow bg-blend-overlay bg-[url(${img})] bg-cover bg-center`}
            ></div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Audition;
