---
title: "Inception"
layout: post
date: 2016-11-17 14:53
image: /assets/images/parking/spinner.jpg
headerImage: true
tag:
- machine learning
- deep learning
blog: true
star: false
author: cpmajgaard
description: A look at inception modules
---
### Full Circle
Remember when we re-trained Google's Inception v3 model? I had promised I'd give some insight on why it was so effective, and now we've reached that point.

In the last post in which I explained convolutional neural networks, I omitted mentioning a certain convolutional building block. That block is the **Inception Module**, from which Google's model gets its name. This module was first described [in a paper by Szegedy et.al.](https://arxiv.org/pdf/1409.4842.pdf) in which they propose a 22 layers deep network built to conquer the ImageNet Large-Scale Visual Recognition Challenge.

Let's find out why it's so dang good.

### The Inception Module
Generally, you're faced with a choice at each layer in a convolutional neural network. You can either use a convolution of some size (usually 5x5, 3x3, or 1x1) or some pooling operation. The Inception module says "To heck with that!" and uses 'em all.

Here's the structure of an Inception module.

![inception](/assets/images/parking/inception.jpg)

Instead of just a single convolution, you have a combination of operations which are concatenated at the end. Each operation is beneficial in its own way, and the integrity of each of their results is preserved due to the concatenation rather than some other joining operation.

### Inception v3
So now we've seen the Inception module on it's own. Pretty nifty little thing. Makes you wonder how many of them Google decided to put in their Inception v3 classifier. One? Three?

#### Try ELEVEN...
![incepgraph](/assets/images/parking/graph.png){: class="bigger-image" }

This thing is huge. So huge that I had to lay the image on its side so it wouldn't throw off the formatting of this page. That region that I boxed in red contains a whopping 11 inception modules.

<div class="side-by-side">
    <div class="toleft">
    <img class="image" src="/assets/images/parking/lay1.png" alt="lay1">
    <figcaption class="caption">The Inception module structure provides a great foundation for exploration. Google's engineers clearly saw a need to tinker with the convolutions for even better performance.</figcaption>
    </div>
    <div class="toright">
        <img class="image" src="/assets/images/parking/lay8.png" alt="lay1">
    </div>
</div>


Not all the modules are the same though. For example, in the first module, an additional 3x3 convolution is added on top of the already present one. At the 8th module, the two 3x3 convolutions have been replaced with 2 pairs of 1x7 and 7x1 convolutions. The 5x5 convolution has been replaced with one such pair too.

### Peek Inside

We've learned what convolutions do and we've seen how we can link them together to extract information from an image. But, we haven't seen what the results look like. Let's do that now.

If you know the output dimensions of your convolutional operations, you can write some code to take the individual filters and compose an image of them. It looks like this for an output which is one tensor of size 35x35x32.

```python
# Choose the output point you want to capture
target = sess.graph.get_tensor_by_name('mixed/tower_2/conv:0')

# Run the session to get the output
result = sess.run(target, {'DecodeJpeg/contents:0': image_data})

V = tf.Variable(result)

# Slice off that first dimension so we only have 3 left.
V = tf.slice(V, (0, 0, 0, 0), (1, -1, -1, -1))  # V[0,...]

# Reshape it to be 35,35,32
V = tf.reshape(V, (35, 35, 32))

# Define number of rows/columns of filters in the image we're making
cy = 8
cx = 32/8

#Reshape, transpose, reshape to line it all up and make our image
V = tf.reshape(V, (35, 35, cy, cx))
V = tf.transpose(V, (2, 0, 3, 1))
V = tf.reshape(V, (1, cy * 35, cx * 35, 1))
```


<div class="side-by-side">
  <div class="toleft">
    <p>
    In the example to the left, I've fed an image of a parked car through the network and extracted filter activations at the MaxPool/1x1 branch of Inception v3's first Inception module. The whiter a pixel is, the more excited the filter is about that feature. You can see that some filter are activated by the structure of the windows of the car. Others recognize the square roof.
    </p>
  </div>
    <div class="toright">
    <img class="image" src="/assets/images/parking/max1x1.jpg" alt="max1x1">
    </div>
</div>


<div class="side-by-side">
  <div class="toleft">
    <p>
    Here's another one. This one comes from the 3x3 branch of the same Inception module. You can see that the original qualities of the image are less preserved in these filter activations due to heavier convolution. However, we can clearly see that some filters at this layer have learned to detect the structural essence of a parked car: A rectangular roof with additional rectangles adjacent to each of its four sides (representing windows).
    </p>
  </div>
    <div class="toright">
    <img class="image" src="/assets/images/parking/3x3.png" alt="3x3">
    </div>
</div>

<div class="side-by-side">
  <div class="toleft">
    <p>
This last one is a little more challenging to look at. This is taken from after the series of 1x7 and 7x1 convolutions in the fifth Inception module in the sequence. See if you can spot a few things that look like they belong to a car. You probably can't. This is because, this far in, filters begin to activate on the presence of small concepts, not necessarily edges and contours. So some of the activations you see in this image may *represent the presence* of a collection of rectangles. You just can't see 'em. <sub> also the individual filters are super small (17x17), so maybe that contributes to the difficulty...</sub>
    </p>
  </div>
    <div class="toright">
    <img class="image" src="/assets/images/parking/lay8conv.png" alt="lay8conv">
    </div>
</div>

> If you still haven't watched [this video](https://www.youtube.com/watch?v=AgkfIQ4IGaM), I suggest you do it. Some very cool concepts are demonstrated, and it can really help you get to grips with how filters interact.
