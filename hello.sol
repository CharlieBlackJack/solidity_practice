// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract HelloWorld {
    // bool boolVal_1 = true;
    // bool boolVal_2 = false;

    // uint8 uintVal_1 = 255;
    // uint256 uintVal_2 = 25555555;

    // int8 intVal_1 = -25;

    // bytes11 bytesVal_1 = "Hello World";

    // string stringVal_1 = "I'm a string";

    // address addressVal_1 = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;

    // -------------------------------------------------------------------

    /* 
        6种存储模式
        1. storage  永久性存储
        2. memory   暂时性存储 (可写)
        3. calldata 暂时性存储 (只读)
        4. stack
        5. codes
        6. logs
    */

    string stringVal = "Hello World";

    /* 
        1. struct   结构体
        2. array    数组
        3. mapping  映射
    */

    struct Info {
        string phrase;
        uint256 id;
        address addr;
    }

    Info[] infos;

    mapping(uint256 => Info) infoMapping;

    function sayHello(uint256 _id) public view returns (string memory) {
        if (infoMapping[_id].addr == address(0x0)) {
            return addInfo(stringVal);
        } else {
            return addInfo(infoMapping[_id].phrase);
        }

        // for (uint256 i = 0; i < infos.length; i++) {
        //     if (infos[i].id == _id) {
        //         return addInfo(infos[i].phrase);
        //     }
        // }

        // return addInfo(stringVal);
    }

    function setHelloWorld(string memory newString, uint256 _id) public {
        // stringVal = newString;
        Info memory info = Info(newString, _id, msg.sender);
        infos.push(info);

        infoMapping[_id] = info;
    }

    function addInfo(string memory helloWorldString)
        internal
        pure
        returns (string memory)
    {
        return string.concat(helloWorldString, " from Charlie's contract");
    }
}
