export class BasicApp {

  items = Array.from({ length: 500 }, (_, idx) => {
    return {
      name: `item-${idx}`,
      value: Math.random() * idx
    };
  })
}