import serial

print("Hello. To use this, make sure you've enabled logging in idf.py menuconfig.")

filename = input("Enter a filename to save trace as (CSV) > ")
port = input("Enter the serial port of the device > ")

with serial.Serial(port, 115200) as ser, open(filename, 'w') as f:
    print(f"Logging to {filename}... (Ctrl+C to stop)")
    print("")
    print("Printing the incoming lines:")
    print("")
    while True:
        line = ser.readline().decode('utf-8', errors='ignore')
        print(line);
        f.write(line)
        f.flush()
