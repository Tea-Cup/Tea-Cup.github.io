---
---
square = (x) -> x * x
math =
    square: square
    cube:   (x) -> x * square x

list = [1, 2, 3, 4, 5]

cubes = (math.cube num for num in list)

console.log(cubes)
console.log('test') if list[0] == 1