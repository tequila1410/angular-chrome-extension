export function transformHttpError(some: any) {
  let error = '';
  for (let key in some) {
    let str = some[key].join(' ');
    error += str;
  }

  return error;
}
