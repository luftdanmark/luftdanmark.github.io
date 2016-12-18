---
title: "How to Find a Parking Spot"
layout: post
date: 2016-10-20 22:44
image: /blog/assets/images/parking/lot-header.jpg
headerImage: true
tag:
- machine learning
- jeeves
- neural networks
blog: true
star: false
author: cpmajgaard
description: The beginning of an exploration of image classification
---
## Introduction

The arduous task of finding a parking spot has long plagued humankind. The
availability of parking has become such a critical part of our lives that it
sometimes becomes a deciding factor in whether we chose to go somewhere or do
something at all.

'Novel' industry solutions try to alleviate our doubts by advertising with big
signs outside profit-harvesting parking complexes the number of vacant spots
within. For parking providers with serious cash to spare, such a system can be
achieved by embedding electromagnetic sensors below every spot and running
wiring throughout their concrete monster to feed information about unoccupied
spots to their customers.

The problem with solutions like this are that they cater almost exclusively to
indoor parking complexes in development. Sensors must either be embedded in
concrete below vehicles or attached to the ceiling above a vehicle. This
completely eliminates venues where fitting such a solution is difficult or
straight up impossible (ie. outdoor spaces).

---
## Proposal

What if instead of investing in expensive sensors and their proprietary computer systems,
a webcam and a general purpose computer could be used to monitor multiple spots at once?
Imagine a solution in which a few inexpensive webcams could be mounted
 (with some weatherproofing) and linked together to survey a whole parking lot.
  With minimal effort,
a complementary web presence could be set up to advertise lot vacancy.

---
## Problem

So how the heck do we do it?

*Simple* <sub>well, relatively...</sub>

We train an *image classifier* to discern vacant spots from occupied ones.

A *classifier* is a function which takes an input and assigns the input a label.
The labels are pre-programmed and the classifier has been taught which labels to
assign to which types of input.

An *image classifier* is simply a classifier which takes an image as its input.
This input is typically fed into the function as the pixel-values of the image.


![Classification](/blog/assets/images/parking/Classification.jpg)
<figcaption class="caption">I made this beautiful drawing to make things clearer. Expect more of these.</figcaption>

All we'll have to do is train a classifier on images of empty spots and occupied ones.

---
## Training a Classifier

As we're not the first to venture into the image classification space, many
(very good) machine learning models are already published online. Building and
optimizing a model from scratch could become extremely hairy and the solution
will often fall far behind the results of more reputable models. So for the
purpose of this exercise, we will be using a prefab solution to experiment with.

If you want stellar results in minimal time, I recommend taking a look at the
**Google Inception v3** model. It's the one I chose for this task and I will
also be doing some explanation of it's success in the near future. Additionally,
there are loads of simple tutorials on how to get your own instance of it up and
running in no time.

Google has a really neat
[CodeLab](https://codelabs.developers.google.com/codelabs/tensorflow-for-poets/)
which takes you through training your own Inception classifier. If you prefer
video instruction, *Sirajology* (great YouTube channel btw) has a [neat tutorial
too](https://www.youtube.com/watch?v=QfNvhPx5Px8).


#### The Dataset
Of course, you'll need a dataset to train your classifier on. Since the theme of
this exercise is parking, I've found a [great dataset for our
purposes](http://web.inf.ufpr.br/vri/news/parking-lot-database). This dataset
contains 12,417 images captures from two different parking lots in sunny,
cloudy, and rainy conditions. Theses images have also been pre-segmented into
about **695,900 images** of cars and empty parking spots. This makes our
training really easy.

Because ~700,000 images is a lot of data, let's just train on a fraction of that
data. For the purpose of this exercise, let's only every 12th image from the
`PKLotSegmented/PUC/` directory. If you are following either of the tutorials
from above, you'll need to separate images corresponding to each class into
separate folders (one for *empty* and one for *occupied* spots).

If you aren't afraid of messy bash scripts, you can use the one below to copy a
subset of the files into their respective folders.

```bash
for d in PKLot/PKLotSegmented/PUC/*/ ; do
    for dd in $d* ; do
        COUNTER=0
        for e in $dd/Empty/*; do
            if (($COUNTER % 12 == 0))
            then
                cp $e *YourPathHere*/lotImages/empty/
            fi
            ((COUNTER++))
        done
        for e in $dd/Occupied/*; do
            if (($COUNTER % 12 == 0))
            then
                cp $e *YourPathHere*/lotImages/occupied/
            fi
            ((COUNTER++))
        done
    done
done
```

#### Train that thing!

Now that we have our dataset set up, we can train our model. If you're following
either tutorial, you should have a `retrain.py` file which you can run. It'll
take a bunch of arguments.

```shell
$ python *YourInceptionPath*/retrain.py \
--bottleneck_dir=*YourDirectory*/bottlenecks \
--how_many_training_steps 500 \
--model_dir=*YourDirectory*/inception \
--output_graph=*YourDirectory*/retrained_graph.pb \
--output_labels=*YourDirectory*/retrained_labels.txt \
--image_dir *YourDirectory*/lotImages
```

A quick sidenote about GPUs. [^1]

[^1]: If you have access to a GPU with a CUDA compute capability >=3.0 and have CUDA 8.0 and cuDNN installed, Tensorflow should automagically detect it and make use of it. If this is the case for you, consider upping your `how_many_training_steps` argument to 4000 or more. It'll still be fairly quick. The bulk of the operations with this many images will be converting them to bottleneck files anyway. In my case, this took longer than the actual training.

### Results

If you followed the instructions from your tutorial of choice correctly, you
should now be able to run the accompanying `label_image.py` file on any image
from the PKLot dataset with pretty convincing success. I got somewhere in the
**98%** range for my test set. ***That's scary good***.

Now you might be thinking,
>98%? That's ridiculous. Isn't that just because of overfitting?  
>
> -- <cite>you, probably</cite>

Good question. When you ran `retrain.py`, unless you explicitly specified
otherwise, it automatically set aside 10% of the images for a validation set and
another 10% for a testing set. This way, when training, we keep a completely
isolated test set which our network never knows about and therefore can't
overfit to.

Something else to bear in mind is that all the images in that dataset are of similar or identical
dimensions. The prefab Inception model is also made to accept 299x299 images, so
some scrunching/transformation of our training set was also done during
training. The included `retrain.py` script does this automatically. So if
you decide to take a few pictures of parked cars or empty parking spots from the
top floor of a nearby building, your classifier's confidence may not be as high
if you input a cropped cell-phone camera image of arbitrary size.

#### Okay, that's cool. But why is it so dang good?

Well, that's a pretty heavy question which requires a fair bit of expansion.
If you're interested in learning more about machine learning and image classification (specifically why Inception v3 is so powerful), **stay posted**. I'll be putting together
a series of blog posts exploring machine learning all the way from small scale *logistic classifiers* to the foundations of *deep learning*, also exploring *convolutional neural nets*, and *inception modules* (from which the Inception v3 network is derived).

---
