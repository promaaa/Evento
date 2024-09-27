from django.shortcuts import render
# Create your views here.
rooms = [
    {'id':1, 'name':'BDE Atlantique'},
    {'id':2, 'name':'BDS Atlantique'},
    {'id':3, 'name':'BDA Atlantique'},

]


def home(request):
    context = { 'rooms': rooms}
    return render(request, 'base/home.html', context)

def room(request):
    return render(request, 'room.html')