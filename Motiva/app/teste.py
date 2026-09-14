import serial
import time
 
PORTA = "COM7"  # coloque a COM do ESP32 #1
BAUD = 115200
 
ser = serial.Serial(PORTA, BAUD, timeout=1)
 
time.sleep(2)
 
print("ESP32 conectado!")
print("Digite um comando:")
 
while True:
    comando = input("> ")
 
    ser.write((comando + "\n").encode("utf-8"))
    ser.flush()
 
    print("Enviado:", comando)