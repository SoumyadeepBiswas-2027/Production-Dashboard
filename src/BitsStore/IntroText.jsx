import BlurText from "./BlurText";

const IntroText = () => {
  const text = "LET'S MAKE A PRODUCTIVE DAY !!";  // All text in one string

  return (
    <div className="introText">
      <BlurText
        text={text}
        delay={290}
        animateBy="words"
        direction="top"
        className="text-2xl"
      />
    </div>
  );
};

export default IntroText;
