export function toggleItemFromArray (array, item) {
  const newArray = [...array]
  const index = newArray.indexOf(item)
  if (index > -1) {
    newArray.splice(index, 1)
  } else {
    newArray.push(item)
  }

  return newArray
}
