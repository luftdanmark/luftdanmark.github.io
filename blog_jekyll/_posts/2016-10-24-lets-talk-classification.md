---
title: "Let's Talk Classification"
layout: post
date: 2016-10-24 21:43
image: /blog/assets/images/parking/catdog.jpg
headerImage: true
tag:
- machine learning
- jeeves
- neural networks
blog: true
star: false
author: cpmajgaard
description: Looking at Logistic Classifiers
---
### Recap
Last post, we used transfer-learning on a powerful pre-trained neural network (Inception v3)
to make a classifier which could tell the difference between occupied and vacant
parking spots. I didn't explain much (if anything) about how the classifier works
and how the training is done. I'm going to try to fix this by delving into the
inner workings of neural nets, over the next few blog posts.

### Today on *CP Does Machine Learning*

Today we'll explore the absolute basics of classification. We'll be looking at
logistic classifiers and how to train them. Along the way we'll see things like
the SoftMax function, One-Hot encoding, Cross-Entropy and how to minimize it,
Stochastic Gradient Descent, and Learning Rate.

## Logistic Classifiers
Classifiers don't get much simpler than a logistic classifier. It is a linear
function which takes an input, which in our case is the pixels of an image, and
outputs predictions.

This linear function is just a big matrix multiply which takes our inputs as a
vector (width x height x channels) and multiplies it by a set of weights to
produce one prediction per output class.

![Logistic](/blog/assets/images/parking/Logistic.jpg)
<figcaption class="caption">From now on, I'll use W, X, b, and Y to denote the Weights,
Input, Bias, and Scores respectively. </figcaption>

It is with respect to the weights and the bias where the machine learning comes
into play. Our goal is to find the set of weight and bias values which make our
function good at performing our desired classification.  

### Turning prediction scores into probabilities

![Scores](/blog/assets/images/parking/Scores.png)

Our function will output a prediction score for each of our classes. However
these scores won't do much for us in their raw form. For every image that we
input, each can only have one possible label. So we'll have to turn our scores into
probabilities (a floating point number between 0 and 1). We'll want the probability for
the correct class to be near 1 and the probability for all other classes to be
near 0.

To do this, we'll employ the **SoftMax function**.

The **SoftMax function** is a function which can take any kind of scores and morph them into *proper, sensible* probabilities which sum to 1. Additionally, we don't ever want the probability for a certain class to be 0 or 1. We want a nice spread. The function to achieve this looks like this.

![SoftMax](/blog/assets/images/parking/Softmax.png)
<figcaption class="caption">I cheated with the numbers in this one when I drew it.<br>These probably aren't the real probabilities for the given scores.<br>Please forgive me.</figcaption>

### One-Hot Encoding

Now that we can make nice probabilities for our predictions, we'll need some way
to represent our categories/labels numerically.

This is super simple. We just create a vector (that is as long as there are
labels) for each class where the correct class has a probability of 1 and all
other classes have a probability of 0.

Yet again, I have distilled this into a beautiful handmade diagram.

![OneHot](/blog/assets/images/parking/onehot.jpg)

### Cross-Entropy

Now that we have a neat way to represent our labels mathematically, we have a
much easier time comparing the results of our SoftMax function with the correct
label for a given input.

To compute how far our probabilities are from the correct answer we can use a
nifty technique called the **Cross-Entropy** to find the distance between the
two.


<div class="side-by-side">
    <div class="toleft">
        <img class="image" src="/blog/assets/images/parking/crossentropy.png" alt="crossentropy">
    </div>
    <div class="toright">
        <p>
        The math looks like this. Something to be wary of is that this function isn't symmetric. This means that you should be careful of what you put where. Because there is a log in the function, you can't plug in a zero-value for S. Luckily, our SoftMax function ensures that every label gets a little bit of probability even if the confidence for that label is low.
        </p>
    </div>
</div>

### Review

Let's quickly take a glance at what we have, because all of a sudden we have
quite a few steps.

![Recap](/blog/assets/images/parking/recap.png)

First, we take our input and turn it into scores (logits) via our linear model,
which is just a matrix multiply plus a bias. Then we take those scores and turn
them into useable probabilities with our SoftMax function. Once we have our
probabilities, we can find out how far off our prediction was by using our
Cross-Entropy function to find the distance between our probabilities and our
One-Hot labels.

### Gradient Descent

Now that we can calculate our distance from the correct classification, we want to look at how to find the weights and biases that make our classifier work the best it can. We want low distances for correct classifications and high distances for incorrect classifications.

![Distances](/blog/assets/images/parking/training.png)

One simple way of doing this is calculating the average distance across the entire training-set. This can be achieved by using a function like the one below.

![TrainingLoss](/blog/assets/images/parking/trainingloss.png)

This function takes every available input in the training-set and computes the probabilities for each of our classes. Then it takes the cross-entropy of the probabilities and the correct label for the input. It sums up all these cross-entropy outputs and divides the result by the number of inputs in the training-set, thus yielding an average cross-entropy. We call this the **Training Loss**.

To make our classifier better, we have to drive down this training loss. The lower the loss, the better we are at classifying.

To do this, we can use a technique called **Gradient Descent**.

> Gradient descent is based on the observation that if the multivariable function ***F(x)*** is defined and differentiable in a neighborhood of point ***a***, then ***F(x)*** decreases fastest if one goes from ***a*** in the direction of the negative gradient of ***F*** at ***a***.
>
> -- <cite>adapted from Wikipedia</cite>

Because our training loss is just a function of our weights (***W***) and our Bias(***B***), we can visualize it as the following.

![smallerFunc](/blog/assets/images/parking/smallerfunction.png)

Following the explanation of Gradient Descent above, we can take steps towards the right weights and biases using the operation below. We simply loop over this function for both the weights and the biases, watching our training loss decrease slowly.

<a id="alpha"></a>
![GradientDescent](/blog/assets/images/parking/gradientdescent.png)
<figcaption class="caption">Alpha is the size of our step in the direction of the negative gradient. This is called the Learning Rate. <br>I'll get back to that later, it's important.</figcaption>

### But, We Can Do Better

Gradient Descent is great, but it has its flaws. For one, it's a really
expensive operation to run. Our training loss calculation is huge, and taking
the derivative of it is even harder.

**Consider this:** If computing your loss takes ***n*** operations, computing
the gradient of that function takes roughly ***3n***.

Because our training loss function depends on **all** of our training data and
gradient descent is iterative, that means we'll be looping through our data tens
or hundreds of times.

All this together makes gradient descent terribly unscalable. ***Not Cool.***

#### Solution

Instead, what we'll do is compute a pretty terrible *estimate* of the loss by
only using a sliver of our training data at each step. This sounds like a pretty
silly idea, but it works in practice.

What is very important is that each sliver of training data that we use is
***randomly selected***. I can't stress enough how important this is. If the
sample isn't random enough, this won't work at all.

At each step, although it is much less accurate, our derivative is much cheaper
to compute. To compensate for our inaccurate training loss estimate and derivative, we'll have
to iterate *hundreds or thousands* more times than before. It sounds like we
won't gain much, but in the long run, this is **much more efficient**.

This practice is called **Stochastic Gradient Descent**.

### Momentum and Learning Rate Decay

Because Stochastic Gradient Descent steps take us in fairly random directions but always a little bit towards the minimum of our loss function, we can use the knowledge we accumulate over time to take us towards this minimum in a more efficient way.

To do this, we keep a running average of our gradient and use this to direct us towards the minimum of the loss function.

This is called **Momentum**.

![momentum](/blog/assets/images/parking/momentum.png)
<figcaption class="caption">We combine the running average with the gradient of the current step to guide us in the right direction. <br> Accordingly, we have to update our descent function to utilize the momentum.</figcaption>


Another thing we can do to help us train better is **decay our learning rate** over time. If you don't remember what I'm talking about, [it's the little alpha we used in our gradient descent formula a while back.](#alpha)
It's been proven beneficial to take progressively smaller steps towards the minimum of the loss function over time. This also prevents us from overshooting the minimum if we ever get too close and jump right past it because of a learning rate which is too confident.

![decay](/blog/assets/images/parking/decay.png)
<figcaption class="caption">Applying an exponential decay to your learning rate is a popular option.</figcaption>

### Round-Up
So, now we've figured out how to put together a linear classifier which we can use to assign labels to inputs. We've also learned how to optimize the classifier by using stochastic gradient descent.

This is pretty cool, but it's still a very shallow model. This means that we are nowhere near deep learning yet.

Stay tuned, as I'll be expanding on our current knowledge in a future post where we'll venture *deeper into learning*.<sub>haha! get it?</sub>
