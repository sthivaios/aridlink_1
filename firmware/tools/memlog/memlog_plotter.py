import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.dates as mdates

# user input
input_filename = input("Enter the filename of the CSV file > ")
title = input("Enter a title for the graph > ")
saveas = input("What filename to save the image as? (should be .png) > ")

# load data
df = pd.read_csv(input_filename)
df['datetime'] = pd.to_datetime(df['unix_timestamp'], unit='s')
df = df.sort_values('datetime')

# convert bytes to KB
df['free_heap_kb'] = df['free_heap'] / 1024

# styling stuff
plt.rcParams.update({
    'font.family': 'arial',
    'font.size': 11,
    'axes.linewidth': 0.8,
    'axes.edgecolor': '#333333',
    'axes.labelcolor': '#222222',
    'xtick.color': '#333333',
    'ytick.color': '#333333',
    'figure.dpi': 900,
    'savefig.dpi': 900,
})

fig, ax = plt.subplots(figsize=(8, 4.5))

# plot
ax.plot(
    df['datetime'], df['free_heap_kb'],
    linewidth=0.9,
    color='#1f5aa6',
    solid_capstyle='round'
)

# titles and labels and shit
ax.set_title(title, fontsize=14, fontweight='bold', pad=14)
ax.set_xlabel('Time (UTC)', fontsize=11)
ax.set_ylabel('Free Heap (KB)', fontsize=11)

# ax.spines['top'].set_visible(False)
# ax.spines['right'].set_visible(False)

# add grid background
ax.grid(True, linewidth=0.4, alpha=0.35, linestyle='-')
ax.set_axisbelow(True)

# round y-axis ticks to whole KB
ax.yaxis.set_major_formatter(lambda x, pos: f'{x:.0f}')

# format x-axis dates
ax.xaxis.set_major_formatter(mdates.DateFormatter('%H:%M'))
fig.autofmt_xdate(rotation=45)

plt.tight_layout()

# save
plt.savefig(saveas, dpi=900, bbox_inches='tight')
print("Done. bye!")
