// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
contract Hello3Dot0 {
    // // 基本类型;

    // int public account = 1 * 2 ** 255 - 1;

    // uint public a2 = 1 * 2 ** 256 - 1;

    // bool public flag = false;

    // address public addr = 0x6E788566A96b3F4a764E6a16914F666558b30e56;

    // bytes32 public b2 = hex"1000";

    // enum Status {
    //     Active,
    //     Inactive
    // }

    // // 引用类型
    // int[] public arr;

    // uint[] public arr2;

    // bytes10[] public arr3;

    // address[] public arr4 = [
    //     0x6E788566A96b3F4a764E6a16914F666558b30e56,
    //     0x6E788566A96b3F4a764E6a16914F666558b30e56
    // ];

    // bool[] public arr5 = [true, false];

    // string public str = "hello world";

    // struct Person {
    //     uint8 age;
    //     bool sex;
    //     string name;
    // }

    // Person public zood = Person(18, false, "zood");

    // Person public person = Person({age: 18, sex: false, name: "zood"});

    string private hello = "hello";

    function sayHello(string memory name) public view returns (string memory) {
        return sayHello2(name);
    }

    function sayHello2(
        string memory name
    ) internal view returns (string memory) {
        return string.concat(hello, name);
    }

    function fn(
        string memory base,
        string memory name
    ) public pure returns (string memory) {
        return string.concat(base, name);
    }

    function setHello(string memory str) public {
        hello = str;
    }
}
