---
title: "Going Deeper"
layout: post
date: 2016-11-2 14:53
image: /assets/images/parking/wehavetogodeeper.jpg
headerImage: true
tag:
- machine learning
- deep learning
- jeeves
- neural networks
blog: true
star: false
author: cpmajgaard
description: Looking at the foundation of deep learning
---
## Introduction
Last post, we looked at logistic classifiers and how they can be used on images. We covered Softmax, One-Hot encoding, Cross-Entropy, Stochastic Gradient Descent, Momentum, and Learning Rate Decay.

This post, we will be taking what we learned last time and applying it to building a deep network.

### A Quick Review of the Linear model

Let's glance back at our model from last post and review it's complexity.

Consider an example where we take 30x30 images and assign them one of 5 different classes. Using our linear model, that yields us with 4,505 parameters.

![NumParams](/assets/images/parking/numparams.jpg)

This is generally how this works. If you have ***n*** inputs and ***k*** outputs, you'll typically end up with ***(n+1)k*** parameters, where the ***+1*** is the weights (which are a ***1 x k*** vector).

***(n+1)k*** parameters is cool and all, but when it comes to building a neural network in practice, you may want to use many more parameters.

Additionally, there's no hiding that the Linear Model is **Linear**. This means that the kind of interaction between inputs that you can represent is very limited.

![linear](/assets/images/parking/linear.jpg)
<figcaption class="caption">An abridged guide to linear models</figcaption>

For example, if two of your inputs are related in an additive way, you're golden. Your model can represent this well using a matrix multiply. However, if two inputs are related in a way where the output is determined by the product of these inputs, you'll have some trouble modeling this efficiently with a Linear Model.

#### Let's not get too negative, though.
Linear models are super-efficient running on the right equipment. Big matrix multiplies are exactly what GPUs are made for. Luckily for us, because of the boom in high-end enthusiast-level gaming hardware, GPUs are relatively cheap and crazy fast.

Additionally, linear models are numerically stable. Small changes in input will never yield massive changes in the output.

![derivatives](/assets/images/parking/linearderivatives.jpg)
<figcaption class="caption">Look at this derivative. That is a nice derivative.</figcaption>

In terms of derivatives, linear functions are friendly too. From any calculus class, you should know that the derivative of a linear function is constant. I'm pretty sure you can't get much more numerically stable than that.

![nonlinearities](/assets/images/parking/nonlinearities.jpg)
<figcaption class="caption">If we want our model to be more than just a big linear operation, we'll need to insert something in between our weights.</figcaption>


So, what we'd like to do is to keep our parameters within nice big linear functions. But, we also want to make our entire model non-linear. We can't just keep multiplying by linear functions, because that's just equivalent to one big linear function. So, we'll have to put some non-linearities in our model.


### Let's Get Non-Linear!

***Behold the RELU!***

![relu](/assets/images/parking/relu.jpg)

**RELU** stands for **Rectified Linear Unit** and it is most-definitely the simplest non-linear function you will ever see. It's linear if ***x>0*** and it's ***0*** everywhere else.

**RELUs** have nifty derivatives as well. When ***x<0***, the derivative is ***0*** too. When ***x>0***, their derivative is ***1***. Can't mess this one up.

### Using the RELU

Because we (computer science students) work *smart* instead of hard, we'll take our linear model and do the minimum amount of work to render it non-linear.

Instead of using a single matrix multiply, we'll construct our new classifier to use two such matrix multiplies joined by one or more RELUs betwixt them.

![relunet](/assets/images/parking/relunet.jpg)

We've just ~~killed two birds with one stone~~ *crossed two T's with one stroke of the pen*.

Not only have we made our model non-linear, we've also added another parameter which we can adjust: the number of RELUs which we have in the classifier (***R*** in the diagram).


### Deja-Vu from Single-Variable Calculus

One of the reasons that we choose to compose our model by stacking simple operations like multiplications, additions, and RELUs is that it makes the math very overcomeable. Simple enough that pretty much any deep-learning library/framework can take care of it for you.

The key insight here is the **Chain Rule**. The **Chain Rule** says that if you have two functions which are composed, then you can compute the derivatives of that function by taking the product of the derivatives of the components.

As long as you know how to write the derivatives of your individual functions, you have a simple way of combining them to compute the derivative for the entire function.

Consider this example.
Imagine a network which is a stack of simple operations, just like we have been doing it so far. It has two linear transforms, which take parameters, and a number of other operations which take no parameters.
Input data flows forward through this graph, changing along the way, until it becomes a set of predictions. We've seen this before.

![forward](/assets/images/parking/forwardprop.jpg)

To compute the derivatives of this model, you create another graph in which our data flows the opposite direction. When data flows backwards through this graph, it gets combined using the Chain Rule and produces gradients.

![backwards](/assets/images/parking/backprop.jpg)

Just like with the Logistic Classifier, we use a loss function to determine how far off from the ideal output we are. The key difference here is that, since we have multiple layers, we need to calculate gradients for this loss function by using the derivatives of each of its component functions in conjunction with the chain rule.

This process is called **Back-Propagation** and it is extremely utile. It makes finding the derivatives of complex composite functions very efficient, given that the function is composed of simple operations with simple derivatives.

My explanation seems a bit loosey-goosey. I'm aware. But the convenient truth is that such a graph can be created entirely automatically using just the individual operations in the network. Because this is so simple to do computationally, most deep learning libraries take care of this for you. I could spend a few hundred words or so trying to explaining it, but it is essentially just the using the chain rule.



### In Practice
If we were to run *Stochastic Gradient Descent* with this model, it would work as follows.

1. For each little batch of our training set, we would flow data through the model like we usually would, producing predictions.

2. Then we would run our *Back-Propagation*, which would give us gradients *for each of our weights* in our network.

3. Then, just like we did with the logistic classifier, we would apply these gradients with a learning rate to the original weights, updating them.   

4. Repeat, until we get good.

### Deeper Yet

Ok, so now we've built ourselves a pretty simple neural network. Although we've made it a little more lengthy than before, it's still fairly shallow. We could make it more complex by increasing the size of our RELU layer in the middle, but it turns out that increasing our ***R*** isn't particularly efficient. To see any effect, we'd have to make it seriously large. However, that would also make it much harder to train our model.

This is where the core idea of deep learning begins to rear its mangled Picasso-like (but weirdly beautiful) head.

![Picasso](http://itsnotyourbirthday.com/wp-content/uploads/1881/10/PICASSO-GIRL-MIRROR-620x465.jpg)  
<figcaption class="caption">Deep Learning takes a look at itself in the mirror</figcaption>


Instead, we can just add more layers to make our model deeper. There are plenty of good reasons to make our model deeper. It turns out that we get much better performance with fewer parameters by going deeper instead of wider. Additionally, a lot of natural/human-made objects have a hierarchical structure which deeper models capture very naturally.

![features](/assets/images/parking/features.jpg)
<figcaption class="caption">This network has learned how to identify a dog in the later layers. The first has taught itself edge detection.</figcaption>

If we were to pop the hood on a deep image-classification model, we would discover that the lower layers would capture simpler things like lines and edges, while higher-up layers would capture features like geometric shapes, and in turn the highest levels would recognize whole objects like cars or dogs or faces.

### Summary
**Here's what we figured out this time:**
1. The linear model has a handful of limitations, but it acts as an excellent building block.

2. The more knobs we have available to tune during training, the better.

3. It's super easy to make linear models non-linear by adding Rectified Linear Units.

4. We can find the gradients for our weights by back-propagating (which is just the chain rule), if we build our network using simple operations.

5. We should seek to make our models deeper, rather than wider to increase parameter efficiency and allow for each part of the network to perform a unique job.
