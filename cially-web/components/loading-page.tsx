export default function LoadingSVG() {
  return (
    <>
      <div className="mt-30 w-30 place-self-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
          <title>Loading</title>
          <g fill="none" stroke="#ad023e" strokeWidth="2">
            <circle cx="22" cy="22" r="19.5128">
              <animate
                fill="remove"
                restart="always"
                additive="replace"
                accumulate="none"
                repeatCount="indefinite"
                keySplines="0.165, 0.84, 0.44, 1"
                keyTimes="0; 1"
                calcMode="spline"
                values="1; 20"
                dur="1.8s"
                begin="0s"
                attributeName="r"
              ></animate>
              <animate
                fill="remove"
                restart="always"
                additive="replace"
                accumulate="none"
                repeatCount="indefinite"
                keySplines="0.3, 0.61, 0.355, 1"
                keyTimes="0; 1"
                calcMode="spline"
                values="1; 0"
                dur="1.8s"
                begin="0s"
                attributeName="stroke-opacity"
              ></animate>
            </circle>
            <circle cx="22" cy="22" r="12.2189">
              <animate
                fill="remove"
                restart="always"
                additive="replace"
                accumulate="none"
                repeatCount="indefinite"
                keySplines="0.165, 0.84, 0.44, 1"
                keyTimes="0; 1"
                calcMode="spline"
                values="1; 20"
                dur="1.8s"
                begin="-0.9s"
                attributeName="r"
              ></animate>
              <animate
                fill="remove"
                restart="always"
                additive="replace"
                accumulate="none"
                repeatCount="indefinite"
                keySplines="0.3, 0.61, 0.355, 1"
                keyTimes="0; 1"
                calcMode="spline"
                values="1; 0"
                dur="1.8s"
                begin="-0.9s"
                attributeName="stroke-opacity"
              ></animate>

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 44 44">
                <title>Loading</title>
                <g fill="none" stroke="#ad023e" strokeWidth="2">
                  <circle cx="22" cy="22" r="12.5575">
                    <animate
                      fill="remove"
                      restart="always"
                      additive="replace"
                      accumulate="none"
                      repeatCount="indefinite"
                      keySplines="0.165, 0.84, 0.44, 1"
                      keyTimes="0; 1"
                      calcMode="spline"
                      values="1; 20"
                      dur="1.8s"
                      begin="0s"
                      attributeName="r"
                    ></animate>
                    <animate
                      fill="remove"
                      restart="always"
                      additive="replace"
                      accumulate="none"
                      repeatCount="indefinite"
                      keySplines="0.3, 0.61, 0.355, 1"
                      keyTimes="0; 1"
                      calcMode="spline"
                      values="1; 0"
                      dur="1.8s"
                      begin="0s"
                      attributeName="stroke-opacity"
                    ></animate>
                  </circle>
                  <circle cx="22" cy="22" r="19.5478">
                    <animate
                      fill="remove"
                      restart="always"
                      additive="replace"
                      accumulate="none"
                      repeatCount="indefinite"
                      keySplines="0.165, 0.84, 0.44, 1"
                      keyTimes="0; 1"
                      calcMode="spline"
                      values="1; 20"
                      dur="1.8s"
                      begin="-0.9s"
                      attributeName="r"
                    ></animate>
                    <animate
                      fill="remove"
                      restart="always"
                      additive="replace"
                      accumulate="none"
                      repeatCount="indefinite"
                      keySplines="0.3, 0.61, 0.355, 1"
                      keyTimes="0; 1"
                      calcMode="spline"
                      values="1; 0"
                      dur="1.8s"
                      begin="-0.9s"
                      attributeName="stroke-opacity"
                    ></animate>
                  </circle>
                </g>
              </svg>
            </circle>
          </g>
        </svg>
      </div>
    </>
  );
}
