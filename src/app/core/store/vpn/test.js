let a = [{
  cat1: {
    sub1: 2,
    sub2: 1
  },
  cat2: {
    sub1: 32,
    sub3: 22
  }
}, {
  cat3: {
    sub1: 213,
    sub4: 2
  },
}, {
  cat1: {
    sub5: 31,
    sub2: 3
  },
  cat3: {
    sub1: 2312
  }
}];

let result = a.reduce((acc, currentValue) => {
  for (let cat in currentValue) {
    for (let sub in currentValue[cat]) {
      if (!acc[cat]) {
        acc[cat] = {};
        acc[cat][sub] = {
          sum: currentValue[cat][sub],
          count: 1,
          average: currentValue[cat][sub]
        }
      } else {
        if (!acc[cat][sub]) {
          acc[cat][sub] = {
            sum: currentValue[cat][sub],
            count: 1,
            average: currentValue[cat][sub]
          }
        } else {
          acc[cat][sub] = {
            sum: currentValue[cat][sub] + acc[cat][sub].sum,
            count: acc[cat][sub].count + 1,
            average: (currentValue[cat][sub] + acc[cat][sub].sum) / (acc[cat][sub].count + 1)
          }
        }
      }
    }
  }
  return acc;
}, {});

// for(let cat in result) {
//   for(let sub in result[cat]) {
//     result[cat][sub].avarage = result[cat][sub].sum / result[cat][sub].count;
//   }
// }

console.log('result: ', result)
