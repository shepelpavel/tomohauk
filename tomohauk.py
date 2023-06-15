from tkinter import *
from tkinter import messagebox

def doit():
    inp = textinput.get()
    messagebox.showinfo('message', f'text - {inp}')

window = Tk()
window.title("Tomohauk PY")
window.geometry('400x300')

frame = Frame(window, padx = 10, pady = 10)
frame.pack(expand=True)

textlabel = Label(
    frame,
    text="Text = "
)
textlabel.grid(row=3, column=1)

textinput = Entry(
    frame,
)
textinput.grid(row=3, column=2)

btn = Button(
    frame,
    text='doit',
    command=doit
)
btn.grid(row=5, column=2)

window.mainloop()
