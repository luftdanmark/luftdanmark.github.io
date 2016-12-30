---
title: "A Convo-whatnow?"
layout: post
date: 2016-11-8 14:59
image: /blog/assets/images/parking/whatnow.jpg
headerImage: true
tag:
- machine learning
- deep learning
blog: true
star: false
author: cpmajgaard
description: An intro to convolutional neural networks.
---
## An Opportunity
Having gotten this far, you've absorbed a fair bit of knowledge about neural networks in general. We've learned how to optimize classifiers, that non-linear models can represent a greater set of interactions and interdependencies between inputs, and that deeper networks capture structural information much better than networks that are shallow and wide.

However, we haven't done much to cater towards our inputs. What I mean by this is that we haven't really focused on how we can build our network to better support our inputs, given what we know about the structure of our data.

##### Here's a quick example to demonstrate my point.
Imagine we're trying to build a classifier which classifies squares and triangles.

Our dataset contains a wealth of images of these shapes, but the color of these shapes can change from image to image. For our purposes, we don't care about color.

So, which of the following should we do? :
1. Just give our network an input image, as a vector of size WxHx3 (where the 3 is the R,G,B layers) hoping it'll figure it out.
2. Build our network such that color doesn't play an important role, making our training easier as well.

*Given how far you've come, I'm pretty sure you answered correctly.*

##### Another example

Let's say you wanted to build a neural network to detect occurrences of Kanye West in an image. It doesn't really matter where Kanye is in the image, it's still just a picture with Kanye West in it. You just want your network to tell you whether he's there.

If your network had to be trained to learn about Kanye in the top left of the image as well as in the bottom left (well, everywhere in fact), that would require a lot of hard work to train, as well as an extremely varied dataset.

![translationkanye](/blog/assets/images/parking/translation.jpg)

Instead, we can introduce a concept called **translation invariance**. We can explicitly build our network such that it does't matter where an object appears, it's meaning is still largely the same.

> The point here is pretty simple, if your input data is structured in some way and your network doesn't need to learn this structure from scratch, it'll perform much better.

### Weight Sharing
The way to achieve what I was talking about above is using a technique called **weight sharing**. The idea is that for any inputs which you know may contain the same sort of information, you share their weights. This allows for greater training efficiency too, due to not having to teach the same thing to multiple weights.

### Weight Sharing for Images
To implement weight sharing for an image, we would have to build a network which (at every layer where it is desired) shares its parameters/weights across space. The trick to doing this is building something called a **convolutional neural network**.

You may have guessed it already. A convolutional neural network is a neural net which uses convolutions to apply the same weights across an input.

### Convolutions
Let's take an arbitrary image. We can represent this image as a vector dimensioned ***WIDTH x HEIGHT x 3***. Like earlier, the 3 is just the R,G,B layers. We can also refer to this as the *Depth* of the image. This image will be our input.

Let's envision taking a small section of the image (called a *patch*) and running a miniature neural network on this patch. This miniature neural net has ***N*** outputs.

![patch](/blog/assets/images/parking/patch.jpg)


Now, all we do is instead of just this one patch, we do this for every available patch of that size in the input. We just slide our miniature neural net across the image, generating a ***1 x N*** vector at each point as a result. When we're done, all the small result vectors come together to form a new interpretation of the input image. The resulting interpretation has a different width, height, and a depth of ***N***. This whole process is called a **Convolution**.
<div class="side-by-side">
    <div class="toleft">
    <br><br><br>
        <p>
        As talented an artist as I am, I would still have trouble making this perfectly clear with a drawing. So, I have borrowed some animated imagery from a <a href="https://github.com/vdumoulin/conv_arithmetic">phenomenal source</a>.
        </p>
        <p>
        Bear in mind that this animation doesn't account for any depth. To make this animation perfect, the input should have a depth and so should the resulting interpretation.
        </p>
    </div>
    <div class="toright">
        <img class="image" src="/blog/assets/images/parking/conv.gif" alt="convgif">
        <figcaption class="caption">This animation shows the patch moving across the input and the resulting reduction in dimensionality.</figcaption>
    </div>
</div>

If the size chosen for the *patch* was the same size as the input image, this whole thing would be the exact same as a regular layer in a neural network (just like the ones we dealt with in earlier posts). But because we choose to use a smaller patch instead, we end up with many fewer weights than a regular layer would have. These weights are also shared across the space of our input, giving us the translation invariance we so desperately desired before.


The general pattern with convolutional neural networks is that the form a "pyramid". At the input, you have a vector which is tall, wide, but shallow. Over time, you begin to reduce its height and width, *squeeeeeezing* information about the image into deeper vectors where the depth begins to generally correspond to the semantic complexity of the input.

![pyramid](/blog/assets/images/parking/pyramid.jpg)

 On a trained network, *even just a few layers in*, each **filter** (layer/cross-section on the depth axis) becomes associated with a certain feature. Earlier convolutions produce filters which associate with simpler concepts: edges, curves, and lines. Later convolutions produce filters which correspond to things like the presence of whole objects.

> This is a side-note, but for a really cool demonstration see [this video](https://www.youtube.com/watch?v=AgkfIQ4IGaM) in which two neural network wizards demonstrate the unique responses of different filters on a convolutional network.

##### Plug n' Play
So, to build a convolutional neural network:
1. Stack up some convolutions (You don't have to implement them yourself, most deep learning libraries provide them)

2. Make sure to gradually reduce the dimensions of the data flowing through your network so you end up with a deep and narrow vector towards the end

3. Add a few normal 'fully connected' layers at the end (just like the ones from previous posts)

4. Wham! You've got yourself a classifier. Now train it!


>If you're keen on the calculus part of training neural nets, you might be curious to know how the chain rule works with our weight sharing scheme.
>
>The answer is simple, you just add up the derivatives for every possible patch location on the image. That will give you your gradient.

### Other ConvNet Operations
There are two other building blocks commonly found in convolutional neural nets that I'd like to expand on.



The first is called **Max-Pooling**. It's a way to downsample an image/vector by looking at a neighborhood on a vector and computing the maximum value in that area.

![maxpool](/blog/assets/images/parking/maxpool.jpg)

The size of the neighborhood determines how drastically the vector is downscaled. It is a useful way to downsize a vector without skipping out on important details. Additionally, it's parameter-free; so we don't have do any sort of optimization to make it work properly. It also typically yields more accurate results, because it removes a lot of noise from data flowing though it.

The second operation is a **1x1 Convolution**. Now, you're probably wondering why a convolution of a single pixel or 1x1 patch would do anything for us. Remember the regular convolution: it's just a linear operation which is executed for every patch of an image.

![1by1](/blog/assets/images/parking/1by1.jpg)

 If we intersperse our convolutions with additional 1x1 convolutions, we have just made our network deeper. Adding a 1x1 convolution into the mix is a super cheap/efficient way to add a few extra parameters which can be trained and create a *micro-deep-network* right on top of a patch. **NEAT!**

### Wrap Up
We've seen how weight sharing can accommodate translation invariance (and make training easier), how convolutions work, how to construct a network of convolutions, and how MaxPools and 1x1 convolutions can reduce noise and make your network deeper.

This was the post I was really looking forward to writing. I just had to lay some groundwork beforehand. Convolutional neural networks take the classification game to a whole new level. The super cool part is that because convolutions are such simple building blocks, they create lots of opportunity for experimentation. As long as you have a deep learning library to help you out, you can explore any configuration you can imagine.

If you want to start exploring right away, check out [Andrej Kaparthy's super cool project: ConvNetJS](http://cs.stanford.edu/people/karpathy/convnetjs/demo/cifar10.html), which lets you build and train a convolutional neural net right in your browser.
