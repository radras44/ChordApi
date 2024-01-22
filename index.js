let str = "5321"
str = str.split("").sort((a,b) => a-b).join("")
console.log(str)