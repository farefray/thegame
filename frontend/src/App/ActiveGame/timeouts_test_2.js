let timestamp = Date.now();

// timeout for 1 second
setTimeout(() => {
  const time_after_1sec = Date.now();
  console.log(`But for real,
    its passed: ${(time_after_1sec - timestamp) / 1000.}s.`);
}, 1000)

// now 60 timeouts for 1 sec each ^_^
const arr = [];
for (let index = 0; index < 60; index++) {
  arr.push(1000 * (1 + index));
}

const example_with_correction = () => {
  let start_time = Date.now();
  let iterator = 0;
  const go = (() => {
    if (!arr[iterator]) {
      // iteration is over, show me values
      console.log(`Instead of 60 s. it took - ${(Date.now() - start_time) / 1000.}s.`);
      return;
    }

    const timeoutLength = arr[iterator] - (Date.now() - start_time);
    console.log("TCL: go -> timeoutLength", timeoutLength)

    setTimeout(() => {
      iterator++;
      go()
    }, timeoutLength);
  });

  go();
}

// example_with_correction()


const example_withOUT_correction = () => {
  let start_time = Date.now();
  let iterator = 0;
  const go = (() => {
    if (!arr[iterator]) {
      // iteration is over, show me values
      console.log(`Instead of 60 s. it took - ${(Date.now() - start_time) / 1000.}s.`);
      return;
    }

    console.log("TCL: go -> iterator", iterator)

    setTimeout(() => {
      iterator++;
      go()
    }, 1000);
  });

  go();
}

example_withOUT_correction()