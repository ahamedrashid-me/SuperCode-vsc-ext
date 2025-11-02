// ============================================================================
// SuperCode! Example - Hello World with Functions and Loops
// ============================================================================

fnc greet[name]::int {
    print["Hello, "];
    print[name];
    print["!"];
    get[0];
}

fnc add[a, b]::int {
    get[a + b];
}

fnc factorial[n]::int {
    if [n <= 1] {
        get[1];
    }
    get[n * factorial[n - 1]];
}

fnc main[]::int {
    // Basic I/O
    print["╔═══════════════════════════════════════╗"];
    print["║  SuperCode! Language Demo           ║"];
    print["╚═══════════════════════════════════════╝"];
    print[""];
    
    // Call a function
    greet["SuperCode"];
    print[""];
    
    // Arithmetic
    int result = add[5, 3];
    print["5 + 3 = "];
    print[result];
    print[""];
    
    // Loops
    print["Counting: "];
    loop [int i = 0; i < 5; i = i + 1] {
        print[i];
        print[" "];
    }
    print[""];
    
    // Arrays
    arr{int, 5} numbers = {1, 2, 3, 4, 5};
    print["Array sum: "];
    int sum = 0;
    loop [int i = 0; i < 5; i = i + 1] {
        sum = sum + numbers{i};
    }
    print[sum];
    print[""];
    
    // Recursion
    print["Factorial(5) = "];
    int fact = factorial[5];
    print[fact];
    print[""];
    
    // Groups
    grp Point {
        int x,
        int y
    }
    
    Point p = [10, 20];
    print["Point: ("];
    print[p.x];
    print[", "];
    print[p.y];
    print[")"];
    print[""];
    
    // Conditionals
    int age = 25;
    if [age >= 18] {
        print["You are an adult"];
    } else {
        print["You are a minor"];
    }
    print[""];
    
    // While loop
    print["While loop: "];
    int counter = 0;
    while [counter < 3] {
        print[counter];
        print[" "];
        counter = counter + 1;
    }
    print[""];
    
    // File I/O
    int fd = @open["test.sc", 1];
    if [fd >= 0] {
        @write[fd, "SuperCode works!"];
        @close[fd];
        print["File written successfully"];
    }
    print[""];
    
    print["✓ Demo complete!"];
    get[0];
}
