export default function LoadingSVG() {
  return (
    <div className="mt-30 w-30 place-self-center">
      <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
        <title>Loading</title>
        <g fill="none" stroke="#ad023e" strokeWidth="2">
          <circle cx="22" cy="22" r="19.5128">
            <animate
              accumulate="none"
              additive="replace"
              attributeName="r"
              begin="0s"
              calcMode="spline"
              dur="1.8s"
              fill="remove"
              keySplines="0.165, 0.84, 0.44, 1"
              keyTimes="0; 1"
              repeatCount="indefinite"
              restart="always"
              values="1; 20"
            />
            <animate
              accumulate="none"
              additive="replace"
              attributeName="stroke-opacity"
              begin="0s"
              calcMode="spline"
              dur="1.8s"
              fill="remove"
              keySplines="0.3, 0.61, 0.355, 1"
              keyTimes="0; 1"
              repeatCount="indefinite"
              restart="always"
              values="1; 0"
            />
          </circle>
          <circle cx="22" cy="22" r="12.2189">
            <animate
              accumulate="none"
              additive="replace"
              attributeName="r"
              begin="-0.9s"
              calcMode="spline"
              dur="1.8s"
              fill="remove"
              keySplines="0.165, 0.84, 0.44, 1"
              keyTimes="0; 1"
              repeatCount="indefinite"
              restart="always"
              values="1; 20"
            />
            <animate
              accumulate="none"
              additive="replace"
              attributeName="stroke-opacity"
              begin="-0.9s"
              calcMode="spline"
              dur="1.8s"
              fill="remove"
              keySplines="0.3, 0.61, 0.355, 1"
              keyTimes="0; 1"
              repeatCount="indefinite"
              restart="always"
              values="1; 0"
            />

            <svg viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <title>Loading</title>
              <g fill="none" stroke="#ad023e" strokeWidth="2">
                <circle cx="22" cy="22" r="12.5575">
                  <animate
                    accumulate="none"
                    additive="replace"
                    attributeName="r"
                    begin="0s"
                    calcMode="spline"
                    dur="1.8s"
                    fill="remove"
                    keySplines="0.165, 0.84, 0.44, 1"
                    keyTimes="0; 1"
                    repeatCount="indefinite"
                    restart="always"
                    values="1; 20"
                  />
                  <animate
                    accumulate="none"
                    additive="replace"
                    attributeName="stroke-opacity"
                    begin="0s"
                    calcMode="spline"
                    dur="1.8s"
                    fill="remove"
                    keySplines="0.3, 0.61, 0.355, 1"
                    keyTimes="0; 1"
                    repeatCount="indefinite"
                    restart="always"
                    values="1; 0"
                  />
                </circle>
                <circle cx="22" cy="22" r="19.5478">
                  <animate
                    accumulate="none"
                    additive="replace"
                    attributeName="r"
                    begin="-0.9s"
                    calcMode="spline"
                    dur="1.8s"
                    fill="remove"
                    keySplines="0.165, 0.84, 0.44, 1"
                    keyTimes="0; 1"
                    repeatCount="indefinite"
                    restart="always"
                    values="1; 20"
                  />
                  <animate
                    accumulate="none"
                    additive="replace"
                    attributeName="stroke-opacity"
                    begin="-0.9s"
                    calcMode="spline"
                    dur="1.8s"
                    fill="remove"
                    keySplines="0.3, 0.61, 0.355, 1"
                    keyTimes="0; 1"
                    repeatCount="indefinite"
                    restart="always"
                    values="1; 0"
                  />
                </circle>
              </g>
            </svg>
          </circle>
        </g>
      </svg>
    </div>
  );
}
